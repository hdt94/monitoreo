const { getDataflowEnv } = require('./env');

const { envCloudSecret, streamTopicId } = getDataflowEnv();

function paramsBatchJob({ analysis, executionId, files, userId }) {
  return {
    'analysis-literal': JSON.stringify(analysis),
    'env-cloud-secret': envCloudSecret,
    'input-files': files.join('::'),
    'metadata-literal': JSON.stringify({
      execution_id: executionId,
      job_execution_id: executionId,
      user_id: userId,
    }),
  };
}

function paramsStreamJob({ analysis, executionId, userId }) {
  return {
    'analysis-literal': JSON.stringify(analysis),
    'env-cloud-secret': envCloudSecret,
    'input-topic': streamTopicId,
    'metadata-literal': JSON.stringify({
      job_execution_id: executionId,
      user_id: userId,
    }),
  };
}

function paramsStreamMessage({ analysis, files, executionId, userId }) {
  return JSON.stringify({
    analysis,
    files,
    metadata: {
      execution_id: executionId,
      user_id: userId,
    },
  });
  // As message must contain pipeline parameters, it cannot name fields as template parameters
  // return JSON.stringify({
  //   'analysis-literal': analysis,
  //   'input-files': files,
  //   'metadata-literal': {
  //     execution_id: executionId,
  //     user_id: userId,
  //   },
  // });
}

module.exports = {
  paramsBatchJob,
  paramsStreamJob,
  paramsStreamMessage,
};
