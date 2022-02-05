const { Router } = require('express');

const controllers = require('../controllers/templates');

function initTemplatesRouter() {
  const router = new Router();

  router.get('/', controllers.readMany);

  return router;
}

module.exports = { initTemplatesRouter };
