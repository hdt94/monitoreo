const { Pool } = require('pg');

const config = require('../config');

const pool = new Pool({
  database: config.PGDATABASE,
  host: config.PGHOST,
  password: config.PGPASSWORD,
  port: config.PGPORT,
  user: config.PGUSER,
});

async function connect() {
  let retries = 10;

  while (retries > 0) {
    try {
      await pool.connect();
      console.log('Connected successfully to database');
      break;
    } catch (err) {
      console.log(`Error connecting to database: ${err}`);
      retries -= 1;
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  }

  if (retries === 0) {
    throw new Error('Excessive number of retries');
  }
}

module.exports = { connect, pool };
