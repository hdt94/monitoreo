const { launchBatchJob, launchStreamJob } = require('./launch');
const { updateJobsStates } = require('./update.js');
const queries = require('../../db/queries/jobs');
const { selectOneTemplate } = require('../../db/queries/templates');
const dataflow = require('../../external/dataflow');

async function createOne(req, res) {
  const { templateId } = req.body;

  const { template, templateCount } = await selectOneTemplate({
    templateId,
  });
  if (templateCount !== 1) {
    return res.status(404).send(`Unknown template "${templateId}"`);
  }

  const args = { req, res, template };
  switch (template.type) {
    case 'batch': {
      launchBatchJob(args);
      return;
    }
    case 'stream': {
      launchStreamJob(args);
      return;
    }
    default:
      return req.status(500).json({
        error: { message: `Unknown template type: "${template.type}"` },
      });
  }
}

async function readMany(req, res) {
  // TODO filter list
  // TODO pagination
  const { dataflowJobs } = await dataflow.listJobs();
  if (dataflowJobs.length === 0) {
    res.json({ data: [] });
    return;
  }

  const { error, jobs, dataflowJobsWithNewState } = await queries.selectJobs({
    dataflowJobs,
  });
  if (error) {
    return res.status(400).json({ error });
  }

  await res.json({ data: jobs });

  updateJobsStates({ dataflowJobsWithNewState });
}

async function readOne(req, res) {
  const { id } = req.params;

  const { dataflowJob } = await dataflow.getJob({
    jobId: id,
  });
  if (Boolean(dataflowJob) === false) {
    const message = 'Not found';
    return res.status(404).json({ error: { message } });
  }

  const { error, jobs, dataflowJobsWithNewState } = await queries.selectJobs({
    dataflowJobs: [dataflowJob],
  });
  if (error) {
    return res.status(400).json({ error });
  }

  await res.json({ data: jobs });

  updateJobsStates({ dataflowJobsWithNewState });
}

module.exports = {
  createOne,
  readMany,
  readOne,
};
