const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getDb } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Ensure table exists
const db = getDb();
db.prepare(
  'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)'
).run();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/items', (_req, res) => {
  const rows = db.prepare('SELECT id, name FROM items ORDER BY id DESC').all();
  res.json(rows);
});

app.post('/api/items', (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }
  const info = db.prepare('INSERT INTO items (name) VALUES (?)').run(name);
  const item = db.prepare('SELECT id, name FROM items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(item);
});

app.delete('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid id' });
  const info = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${PORT}`);
  });
}

module.exports = app;


