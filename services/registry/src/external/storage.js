const { Storage } = require('@google-cloud/storage');

class BucketClient {
  constructor({ bucketName, projectId }) {
    const storageClient = new Storage({ projectId });
    this.bucket = storageClient.bucket(bucketName);
  }

  writeBuffer({ buffer, contentEncoding, contentType, metadata, objectName }) {
    return new Promise((resolve, reject) => {
      const blob = this.bucket.file(objectName);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentEncoding,
          contentType,
          metadata,
        },
      });

      blobStream.on('error', reject);
      blobStream.on('finish', () =>
        resolve(`gs://${this.bucket.id}/${objectName}`)
      );
      blobStream.end(buffer);
    });
  }
}

module.exports = {
  BucketClient,
};
