const express = require('express');

const { mongoStore } = require('./db');

const { initRouter } = require('./routes');

async function init(app) {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(initRouter());

  const { STORE_MONGO_URI, STORE_MONGO_DB } = process.env;
  await mongoStore.initConnect(STORE_MONGO_URI, STORE_MONGO_DB);
}

module.exports = init;
