const { Router } = require('express');

const filesMiddleware = require('../middleware/measuresFiles');

const lookupAggMap = require('../db/lookups');
const controllers = require('../controllers');

function crud(collection) {
  const router = new Router();
  const lookupAgg = lookupAggMap?.[collection];

  router.get('/', controllers.readerOfMany(collection, lookupAgg));
  router.post('/', controllers.creatorOfOne(collection, lookupAgg));
  router.get('/:id', controllers.readerOfOne(collection));
  router.put('/:id', controllers.updaterOfOne(collection));
  router.delete('/:id', controllers.removerOfOne(collection));

  return router;
}

function measuresRouter() {
  const router = new Router();
  const collection = 'measures';
  const lookupAgg = lookupAggMap?.[collection];

  const {
    GCP_PROJECT_ID,
    MEASURES_FILES_BUCKET,
    MEASURES_FILES_DIR,
    MEASURES_FILES_STORAGE_MODE,
  } = process.env;
  const middlewares = filesMiddleware.middlewares({
    bucketName: MEASURES_FILES_BUCKET,
    destination: MEASURES_FILES_DIR,
    projectId: GCP_PROJECT_ID,
    storageMode: MEASURES_FILES_STORAGE_MODE,
  });

  console.log(`MEASURES_FILES_STORAGE_MODE: ${MEASURES_FILES_STORAGE_MODE}`);

  // const router = crud('measures');
  router.get('/', controllers.readerOfMany(collection, lookupAgg));
  router.post('/', middlewares, controllers.creatorOfOne(collection));
  router.get('/:id', controllers.readerOfOne(collection));
  router.put('/:id', controllers.updaterOfOne(collection));
  router.delete('/:id', controllers.removerOfOne(collection));

  return router;
}

function initRouter() {
  const router = new Router();

  router.use('/analyses', crud('analyses'));
  router.use('/instruments', crud('instruments'));

  router.use('/measures', measuresRouter());

  router.use('/reports', crud('reports'));
  router.use('/structures', crud('structures'));

  return router;
}

module.exports = {
  initRouter,
};
