const { mongoStore } = require('../db');

function creatorOfOne(collection) {
  return async (req, res) => {
    const { body } = req;

    const doc = await mongoStore.createOne(collection, body);

    if (doc) {
      return res.status(201).json(doc);
    }

    // TODO Error feedback
    return res.status(400).send();
  };
}

function readerOfMany(collection, lookupAggs) {
  return async function readMany(req, res) {
    const { id } = req.query;
    const results = await mongoStore.readMany(collection, { id }, lookupAggs);

    if (results?.error) {
      return res.status(400).json(results);
    }

    return res.json(results);
  };
}

function readerOfOne(collection, lookupAggs) {
  return async (req, res) => {
    const { id } = req.params;
    const doc = await mongoStore.readOne(collection, { id }, lookupAggs);

    if (doc) {
      return res.json(doc);
    }

    return res.status(404).send();
  };
}

function removerOfOne(collection) {
  return async (req, res) => {
    const { id } = req.params;
    const doc = await mongoStore.deleteOne(collection, id);

    if (doc) {
      return res.json(doc);
    }

    return res.status(404).send();
  };
}

function updaterOfOne(collection) {
  return async (req, res) => {
    const { id } = req.params;
    const doc = await mongoStore.updateOne(collection, id, req.body);

    if (doc) {
      return res.json(doc);
    }

    return res.status(400).send();
  };
}

module.exports = {
  creatorOfOne,
  readerOfMany,
  readerOfOne,
  removerOfOne,
  updaterOfOne,
};
