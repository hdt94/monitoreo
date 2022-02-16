const { JobsV1Beta3Client } = require('@google-cloud/dataflow');

const { getDataflowEnv } = require('./env');

const { location, projectId } = getDataflowEnv();
const client = new JobsV1Beta3Client({
  projectId,
});

async function cancelJob({ jobId }) {
  try {
    await client.updateJob({
      jobId,
      job: {
        requestedState: 'JOB_STATE_CANCELLED',
        // requestedState: 'JOB_STATE_DRAINED',
      },
      location,
      projectId,
    });

    return {};
  } catch (error) {
    return { error };
  }
}

async function getJob({ jobId }) {
  const [dataflowJob] = await client.getJob({
    jobId,
    location,
    projectId,
  });

  return { dataflowJob };
}

async function listJobs() {
  const [dataflowJobs] = await client.listJobs({
    projectId,
    location,
  });

  return { dataflowJobs };
}

module.exports = {
  cancelJob,
  getJob,
  listJobs,
};
