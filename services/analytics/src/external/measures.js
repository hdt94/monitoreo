const axios = require('axios');

const config = require('../config');

async function getMeasuresMetadata({ measuresId }) {
  const url = `http://${config.REGISTRY_URL}/measures/${measuresId}`;

  try {
    const response = await axios.get(url);

    return response;
  } catch (err) {
    let error;

    if (err.response) {
      error = {
        status: err.response.status,
        ...err.response.data,
      };
    } else {
      const message = err.request
        ? 'Measures requested to registry but no response was received'
        : 'No measures request could be made to registry';

      error = {
        message,
        status: 500,
      };
    }

    return { error };
  }
}

module.exports = { getMeasuresMetadata };
