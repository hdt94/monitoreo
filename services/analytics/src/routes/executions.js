const { Router } = require('express');

const controllers = require('../controllers/executions');
const { inputFilesMiddleware } = require('../middleware/input');

function initExecutionsRouter() {
  const router = new Router();

  router.get('/', controllers.readMany);
  router.post('/', inputFilesMiddleware, controllers.createOne);

  return router;
}

module.exports = { initExecutionsRouter };
