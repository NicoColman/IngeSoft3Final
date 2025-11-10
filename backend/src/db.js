const { Pool } = require('pg');

let poolInstance;

function getPool() {
  if (!poolInstance) {
    poolInstance = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ingsoft3',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
  }
  return poolInstance;
}

async function query(text, params) {
  const pool = getPool();
  return pool.query(text, params);
}

module.exports = { getPool, query };


