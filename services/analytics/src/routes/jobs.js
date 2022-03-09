const { Router } = require('express');

const controllers = require('../controllers/jobs');
const { authenticationMiddleware: auth } = require('../middleware/auth');
const { inputFilesMiddleware: input } = require('../middleware/input');

function initJobsRouter() {
  const router = new Router();

  router.get('/', controllers.readMany);
  router.post('/', [auth, input], controllers.createOne);
  router.get('/:id', controllers.readOne);
  router.post('/:id/cancel', auth, controllers.cancelOne);

  return router;
}

module.exports = { initJobsRouter };
