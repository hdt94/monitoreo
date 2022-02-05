const { notifyUpdate } = require('./notify');
const queries = require('../../db/queries/jobs');

async function updateJobsStates({
  dataflowJobsWithNewState,
  notifying = true,
}) {
  // // temp
  // dataflowJobsWithNewState.push({
  //   name: 't3-e13-u4-1643347641838',
  //   id: '2022-01-30_17_00_07-6867409066414865819',
  //   currentState: new Date().toString(),
  // });
  // const jobs = dataflowJobsWithNewState;
  //
  if (dataflowJobsWithNewState.length === 0) {
    return;
  }

  const { error, jobs } = await queries.updateJobsStates({
    dataflowJobs: dataflowJobsWithNewState,
  });

  if (error) {
    console.error(error);
    return;
  }

  if (notifying) {
    notifyUpdate({ jobs });
  }
}

module.exports = {
  updateJobsStates,
};
