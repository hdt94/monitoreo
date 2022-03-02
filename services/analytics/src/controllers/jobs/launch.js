const { notifyCreate } = require('./notify');
const { insertExecution } = require('../../db/queries/executions');
const queries = require('../../db/queries/jobs');
const dataflow = require('../../external/dataflow');
const {
  paramsBatchJob,
  paramsStreamJob,
} = require('../../external/dataflow/params');

async function _createExecution({ res, templateId, userId }) {
  const { execution, executionCount } = await insertExecution({
    requestType: 'job',
    templateId,
    userId,
  });
  if (executionCount !== 1) {
    return res.status(400).json();
  }

  return { execution };
}

async function _launchJob({ req, res, executionId, template, templateParams }) {
  const { containerSpecGcsPath, id: templateId } = template;

  // jobName must consist of only the characters [-a-z0-9], starting with a letter and ending with a letter or number
  const jobName = `${template.name}-template-${templateId}-execution-${executionId}`;
  const { dataflowJob, error, message } = await dataflow.launchFlexTemplate({
    containerSpecGcsPath,
    jobName,
    parameters: templateParams,
  });
  if (error) {
    return res.status(400).json({ error, message });
  }

  // Testing
  // const dataflowJob = {
  //   id: new Date().getTime(),
  //   currentState: 'JOB_STATE_UNKNOWN',
  //   currentStateTime: 'currentStateTime',
  //   name: jobName,
  //   type: 'batch',
  // };
  const { job, jobCount } = await queries.insertJob({
    dataflowJob,
    executionId,
    templateId,
  });
  if (jobCount !== 1) {
    return res
      .status(500)
      .json({ message: 'Job has been started but database updating failed' });
  }

  await res.json(job);

  notifyCreate({ job });
}

async function launchBatchJob({ req, res, template }) {
  const { analysis, files, userId } = req.body;
  const { id: templateId } = template;

  const { execution } = await _createExecution({ res, templateId, userId });
  if (res.headersSent) {
    return;
  }

  const executionId = execution.id;
  const templateParams = paramsBatchJob({
    analysis,
    executionId,
    files,
    userId,
  });
  await _launchJob({
    executionId,
    req,
    res,
    template,
    templateParams,
  });
}

async function launchStreamJob({ req, res, template }) {
  const { analysis, userId } = req.body;
  const { id: templateId } = template;

  const { execution } = await _createExecution({ res, templateId, userId });
  if (res.headersSent) {
    return;
  }

  const executionId = execution.id;
  const templateParams = paramsStreamJob({
    analysis,
    executionId,
    userId,
  });
  await _launchJob({
    executionId,
    req,
    res,
    template,
    templateParams,
  });
}

module.exports = {
  launchBatchJob,
  launchStreamJob,
};
