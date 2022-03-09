const express = require('express');

const { initFirebase } = require('./external/firebase');
const { initRouter } = require('./routes');

async function init(app) {
  await initFirebase();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(initRouter());
}

module.exports = init;
