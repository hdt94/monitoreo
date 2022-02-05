const { Router } = require('express');

const { initExecutionsRouter } = require('./executions');
const { initJobsRouter } = require('./jobs');
const { initTemplatesRouter } = require('./templates');

function initRouter() {
  const router = new Router();

  router.use('/executions', initExecutionsRouter());
  router.use('/jobs', initJobsRouter());
  router.use('/templates', initTemplatesRouter());

  return router;
}

module.exports = {
  initRouter,
};
