const axios = require('axios');

const config = require('../config');

async function verifyAccessToken({ accessToken }) {
  const url = `http://${config.USERS_URL}/access/verify/${accessToken}`;

  try {
    const response = await axios.get(url);

    return response;
  } catch (error) {
    return { error };
  }
}

module.exports = { verifyAccessToken };
