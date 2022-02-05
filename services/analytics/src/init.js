const express = require('express');

const config = require('./config');
const cron = require('./cron');
const { connect } = require('./db');
const connection = require('./external/connection.live');
const { initRouter } = require('./routes');

async function init(app) {
  await connect();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(initRouter());

  await connection.init({
    liveHost: config.LIVE_WS_URL,
  });

  cron.start();
}

module.exports = init;
