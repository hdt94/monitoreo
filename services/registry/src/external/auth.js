const axios = require('axios');

async function verifyAccessToken({ accessToken }) {
  const { USERS_URL } = process.env;
  const url = `http://${USERS_URL}/access/verify/${accessToken}`;

  try {
    const response = await axios.get(url);

    return response;
  } catch (error) {
    return { error };
  }
}

module.exports = { verifyAccessToken };
