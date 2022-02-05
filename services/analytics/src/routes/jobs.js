const { Router } = require('express');

const controllers = require('../controllers/jobs');
const { inputFilesMiddleware } = require('../middleware/input');

function initJobsRouter() {
  const router = new Router();

  router.get('/', controllers.readMany);
  router.post('/', inputFilesMiddleware, controllers.createOne);
  router.get('/:id', controllers.readOne);

  return router;
}

module.exports = { initJobsRouter };
