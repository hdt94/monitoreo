const { Router } = require('express');

const controllers = require('../controllers/executions');
const { authenticationMiddleware: auth } = require('../middleware/auth');
const { inputFilesMiddleware: input } = require('../middleware/input');

function initExecutionsRouter() {
  const router = new Router();

  router.get('/', controllers.readMany);
  router.post('/', [auth, input], controllers.createOne);

  return router;
}

module.exports = { initExecutionsRouter };
