const { PubSub } = require('@google-cloud/pubsub');

const config = require('../config');

const pubSubClient = new PubSub({
  projectId: config.GCP_PROJECT_ID,
});

async function publishMessage({ data, eventType, topicId }) {
  const dataBuffer = Buffer.from(data);
  const attributes = {
    eventType,
  };

  try {
    const messageId = await pubSubClient
      .topic(topicId)
      .publish(dataBuffer, attributes);

    return { messageId };
  } catch (error) {
    return { error };
  }
}

module.exports = { publishMessage };
