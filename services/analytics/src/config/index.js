const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const dotenv = require('dotenv');

async function requestSecrets({ name, projectId }) {
  const client = new SecretManagerServiceClient({ projectId });

  const [accessResponse] = await client.accessSecretVersion({
    name,
    // name: 'projects/project_id/secrets/secret_name/versions/1',
    // name: 'projects/project_number/secrets/secret_name/versions/1',
  });
  const secrets = dotenv.parse(accessResponse.payload.data);

  return secrets;
}

class Config {
  async init() {
    const envFields = [
      'DATAFLOW_JOBS_PROJECT_ID',
      'DATAFLOW_JOBS_LOCATION',
      'GCP_ANALYTICS_ENV_CLOUD_SECRET',
      'GCP_PROJECT_ID',
      'LIVE_WS_URL',
    ];
    envFields.forEach((field) => {
      this[field] = process.env[field];
    });

    const secrets =
      process.env.NODE_ENV === 'development'
        ? process.env
        : await requestSecrets({
            name: this.GCP_ANALYTICS_ENV_CLOUD_SECRET,
            projectId: this.GCP_PROJECT_ID,
          });
    const secretsFields = [
      'PGHOST',
      'PGPORT',
      'PGUSER',
      'PGPASSWORD',
      'PGDATABASE',
      'PUBSUB_TOPIC_STREAM_EXECUTION',
    ];
    secretsFields.forEach((field) => {
      this[field] = secrets[field];
    });
  }
}

module.exports = new Config();
