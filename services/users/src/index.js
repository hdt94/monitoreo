const express = require('express');

const init = require('./init');

const app = express();
const PORT = process.env.PORT || 3000;

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
