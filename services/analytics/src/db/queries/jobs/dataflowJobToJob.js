module.exports = function dataflowJobToJob({
  dataflowJob,
  executionId,
  templateId,
}) {
  const job = {
    currentState: dataflowJob.currentState,
    currentStateTime: dataflowJob.currentStateTime,
    executionId,
    id: dataflowJob.id,
    name: dataflowJob.name,
    templateId,
    type: dataflowJob.type,
  };

  return job;
};
