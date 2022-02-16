const {
  insertExecution,
  updateMessage,
} = require('../../db/queries/executions');
const {
  selectSingleJobWhereRunningTemplate,
} = require('../../db/queries/jobs');
const { getDataflowEnv } = require('../../external/dataflow/env');
const { paramsStreamMessage } = require('../../external/dataflow/params');
const { getJob } = require('../../external/dataflow');
const { publishMessage } = require('../../external/pubsub');

async function requestStreamExecution({ req, res, template }) {
  const { analysis, files, userId } = req.body;
  const templateId = template.id;

  // Verify running job
  const { job, jobCount } = await selectSingleJobWhereRunningTemplate({
    templateId,
  });
  if (jobCount === 0) {
    const message = 'There is no running job for selected template';
    return res.status(422).json({ error: { message } });
  }
  const { dataflowJob } = await getJob({ jobId: job.id });
  if (dataflowJob.currentState !== 'JOB_STATE_RUNNING') {
    const message = `Job is not running: "${dataflowJob.name}" "${dataflowJob.id})"`;
    return res.status(422).json({ error: { message } });
  }

  // Publish execution request message
  const { execution, executionCount } = await insertExecution({
    requestType: 'message',
    templateId,
    userId,
  });
  if (executionCount !== 1) {
    return res
      .status(500)
      .json({ error: { message: "Couldn't create execution request" } });
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

  await res.json(execution);
}

module.exports = {
  requestStreamExecution,
};
