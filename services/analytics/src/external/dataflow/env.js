const config = require('../../config');

module.exports.getDataflowEnv = function getDataflowEnv() {
  const location = config.DATAFLOW_JOBS_LOCATION;
  const projectId = config.DATAFLOW_JOBS_PROJECT_ID;
  const envCloudSecret = config.GCP_ANALYTICS_ENV_CLOUD_SECRET;
  const streamTopicId = config.PUBSUB_TOPIC_STREAM_EXECUTION;

  if (typeof projectId !== 'string' || projectId.length === 0) {
    throw TypeError(
      `Invalid value of "DATAFLOW_JOBS_PROJECT_ID": ${projectId}`
    );
  }

  return { envCloudSecret, location, projectId, streamTopicId };
};
