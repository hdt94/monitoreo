const { MongoClient, ObjectId } = require('mongodb');

function processMatch(inMatch) {
  const match = {};

  if (inMatch?.id) {
    try {
      match._id = Array.isArray(inMatch.id)
        ? {
            $in: inMatch.id.map(ObjectId),
          }
        : ObjectId(inMatch.id);
    } catch (err) {
      if (err instanceof TypeError) {
        return { error: true, message: 'Invalid type of id' };
      }

      return { error: true, message: err.message };
    }
  }

  return { error: false, match };
}

function renameIdFromUnderscored(doc) {
  doc.id = doc._id;
  delete doc._id;
  return doc;
}

class MongoStore {
  __retries = 0;

  async initConnect(uri, db) {
    this.__client = new MongoClient(uri);
    console.log('Connecting to MongoDB...');
    await this.connect();
    this.__db = this.__client.db(db);
  }

  async connect() {
    try {
      await this.__client.connect();
      this.__retries = 0;
    } catch (error) {
      console.error(error);

      if (this.__retries > 0) {
        throw error;
      }
      this.__retries += 1;

      return new Promise((resolve, reject) =>
        setTimeout(async () => {
          console.log('Retrying connection to MongoDB...');
          try {
            await this.connect();
            resolve();
          } catch (err) {
            reject(err);
          }
        }, 30000)
      );
    }
  }

  async createOne(collection, inDoc) {
    const coll = this.__db.collection(collection);
    const result = await coll.insertOne(inDoc);

    if (result.acknowledged) {
      const doc = await coll.findOne({ _id: result.insertedId });

      if (doc) {
        return renameIdFromUnderscored(doc);
      }
    }

    return null;
  }

  async deleteOne(collection, id) {
    const match = {};
    try {
      match._id = ObjectId(id);
    } catch (err) {
      return null;
    }

    const result = await this.__db
      .collection(collection)
      .findOneAndDelete(match);
    if (result.ok) {
      return renameIdFromUnderscored(result.value);
    }

    return null;
  }

  async readMany(collection, inMatch = {}, lookupAgg = []) {
    const { error, match, message } = processMatch(inMatch);
    if (error) {
      return { error, message };
    }

    const coll = this.__db.collection(collection);
    const promise =
      lookupAgg.length === 0
        ? coll.find(match)
        : coll.aggregate([
            {
              $match: match,
            },
            ...lookupAgg,
          ]);
    const docs = await promise.toArray();

    return docs.map(renameIdFromUnderscored);
  }

  async readOne(collection, inMatch = {}, lookupAgg = []) {
    const { error, match, message } = processMatch(inMatch);
    if (error) {
      return { error, message };
    }
    const coll = this.__db.collection(collection);
    const promise =
      lookupAgg.length === 0
        ? coll.findOne(match)
        : coll.aggregate([
            {
              $match: match,
            },
            ...lookupAgg,
          ]);
    const doc = await promise;

    if (doc) {
      return renameIdFromUnderscored(doc);
    }

    return null;
  }

  async updateOne(collection, id, inDoc) {
    const coll = this.__db.collection(collection);
    const match = {};
    try {
      match._id = ObjectId(id);
    } catch (err) {
      return null;
    }

    delete inDoc._id;
    delete inDoc.id;

    const result = await coll.updateOne(match, { $set: inDoc });
    if (result.acknowledged) {
      const doc = await coll.findOne(match);

      if (doc) {
        return renameIdFromUnderscored(doc);
      }
    }

    return null;
  }
}

module.exports = { mongoStore: new MongoStore() };
