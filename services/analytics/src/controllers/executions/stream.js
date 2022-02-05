const { launchStreamJob } = require('../jobs/launch');
const config = require('../../config');
const {
  insertExecution,
  updateMessage,
} = require('../../db/queries/executions');
const { selectJobWhereRunningTemplate } = require('../../db/queries/jobs');
const { getDataflowEnv } = require('../../external/dataflow/env');
const { paramsStreamMessage } = require('../../external/dataflow/params');
const { publishMessage } = require('../../external/pubsub');

async function requestStreamExecution({ req, res, template }) {
  const { analysis, files, userId } = req.body;

  const templateId = template.id;

  const { jobCount } = await selectJobWhereRunningTemplate({
    templateId,
  });
  // TODO Query Dataflow service if job is still running
  if (jobCount === 0) {
    const message = 'There is no running job for selected template';
    return res.status(422).json({ error: { message } });
  }

  const { execution, executionCount } = await insertExecution({
    requestType: 'message',
    templateId,
    userId,
  });
  if (executionCount !== 1) {
    return res
      .status(500)
      .json({ error: { message: "Coudln't create execution submission" } });
  }

  const executionId = execution.id;
  const { streamTopicId } = getDataflowEnv();
  const data = paramsStreamMessage({
    analysis,
    executionId,
    files,
    userId,
  });
  const { error, messageId } = await publishMessage({
    data,
    eventType: 'submission',
    topicId: streamTopicId,
  });
  if (error) {
    return res.status(400).json({ error });
  }

  const update = await updateMessage({
    executionId,
    messageId,
  });
  if (update?.error) {
    await res.status(400).json({ error: update.error });
  }

  res.json({ executionId, messageId });
}

module.exports = {
  requestStreamExecution,
};