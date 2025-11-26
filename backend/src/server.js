const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getPool, query } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Ensure table exists
async function initDb() {
  const maxRetries = 10;
  const retryDelay = 2000; // 2 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS items (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        )
      `);
      console.log('Database initialized successfully');
      return;
    } catch (err) {
      if (i === maxRetries - 1) {
        console.error('Error initializing database after retries:', err);
        throw err;
      }
      console.log(`Database connection attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

initDb().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/items', async (_req, res) => {
  try {
    const result = await query('SELECT id, name FROM items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', async (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const result = await query('INSERT INTO items (name) VALUES ($1) RETURNING id, name', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items', async (_req, res) => {
  try {
    await query('DELETE FROM items');
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid id' });
  try {
    const result = await query('DELETE FROM items WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${PORT}`);
  });
}

module.exports = app;


