const express = require('express');

const config = require('./config');

const app = express();
const PORT = process.env.PORT || 3000;

async function main() {
  await config.init();

  const init = require('./init');

  init(app)
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Error initializing app');
      console.error(err);
    });
}

main();
