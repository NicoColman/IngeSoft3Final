const Database = require('better-sqlite3');
const path = require('path');

let dbInstance;

function getDb() {
  if (!dbInstance) {
    const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '..', 'data.db');
    dbInstance = new Database(dbPath);
  }
  return dbInstance;
}

module.exports = { getDb };


