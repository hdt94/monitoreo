const { Router } = require('express');

const { verifyAccessToken } = require('../controllers/tokens');

function initRouter() {
  const router = new Router();

  router.get('/access/verify/:accessToken', verifyAccessToken);

  return router;
}

module.exports = {
  initRouter,
};
