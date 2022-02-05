const { updateJobsStates } = require('../../controllers/jobs/update.js');
const dataflow = require('../../external/dataflow');
const queries = require('../../db/queries/jobs');

async function cronUpdateJobsStates() {
  const { dataflowJobs } = await dataflow.listJobs();
  if (dataflowJobs.length === 0) {
    return;
  }

  const { error, dataflowJobsWithNewState } = await queries.selectJobs({
    dataflowJobs,
  });
  if (error) {
    throw new Error(error?.message);
  }

  updateJobsStates({ dataflowJobsWithNewState });
}

module.exports = {
  cronUpdateJobsStates,
};
