const { FlexTemplatesServiceClient } =
  require('@google-cloud/dataflow').v1beta3;

const { getDataflowEnv } = require('./env');

const { location, projectId } = getDataflowEnv();
const client = new FlexTemplatesServiceClient({
  projectId,
});

async function launchFlexTemplate({
  containerSpecGcsPath,
  jobName,
  parameters,
}) {
  const request = {
    projectId,
    location,
    launchParameter: {
      containerSpecGcsPath,
      jobName,
      parameters,
      // TEMP
      environment: {
        machineType: 'n1-standard-2',
      },
    },
  };

  try {
    const [{ job: dataflowJob }] = await client.launchFlexTemplate(request);

    return { dataflowJob };
  } catch (err) {
    console.error(err);
    return { error: true, message: err.message };
  }
}

module.exports = {
  launchFlexTemplate,
};
