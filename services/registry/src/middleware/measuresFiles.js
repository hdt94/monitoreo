const path = require('path');

const multer = require('multer');

const { BucketClient } = require('../external/storage');

function defineMulterStorage({ destination, storageType }) {
  const limits = {
    fieldSize: 100_000_000,
  };

  switch (storageType) {
    case 'disk':
      return multer.diskStorage({
        destination: destination || '',
        filename(req, file, cb) {
          const ext = path.extname(file.originalname);
          const base = path.basename(file.originalname, ext);

          cb(null, `${base}__${Date.now()}${ext}`);
        },
        limits,
      });
    case 'memory':
      return multer.memoryStorage({ limits });
    default:
      throw new Error(`Unsupported multer storage type "${storageType}"`);
  }
}

function parseMulterMiddleware(req, res, next) {
  const { body, files } = req;

  if (files) {
    body.files = files.map((file) => file.originalname);
  }

  next();
}

function storeInGoogleStorage({ bucketClient }) {
  return async function googleStorageMiddleware(req, res, next) {
    const { body, files } = req;

    if (files) {
      const { instruments_id, structure_id } = body;
      const metadata = {
        instrumentsId: instruments_id,
      };
      const promises = files.map((file) =>
        bucketClient.writeBuffer({
          buffer: file.buffer,
          contentEncoding: file.encoding,
          contentType: file.mimetype,
          metadata,
          objectName: `${structure_id}/${file.originalname}`,
        })
      );

      try {
        const uris = await Promise.all(promises);

        // body.data_source_config = 'gs';
        body.files = uris;
      } catch (err) {
        return req.status(400).json({ error: err });
      }
    }

    next();
  };
}

module.exports = {
  middlewares({ bucketName, destination, projectId, storageMode }) {
    const local = storageMode === 'local';

    const storage = defineMulterStorage({
      destination,
      storageType: local ? 'disk' : 'memory',
    });
    const upload = multer({ storage });

    if (local) {
      return [upload.array('files'), parseMulterMiddleware];
    }

    if (storageMode !== 'gs')
      throw new Error(`Unknown storage mode "${storageMode}"`);

    const bucketClient = new BucketClient({ bucketName, projectId });

    return [upload.array('files'), storeInGoogleStorage({ bucketClient })];
  },
};
