const process = require('process');

const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

async function decodeToken({ accessToken }) {
  try {
    const auth = await getAuth().verifyIdToken(accessToken);
    return { auth };
  } catch (err) {
    // if (err?.errorInfo) {
    // }
    return { error: { message: 'Invalid token' } };
  }
}

async function initFirebase() {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.GCP_PROJECT_ID,
  });
}

module.exports = { decodeToken, initFirebase };
