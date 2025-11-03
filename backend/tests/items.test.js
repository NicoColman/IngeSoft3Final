const request = require('supertest');
const fs = require('fs');
const path = require('path');

process.env.SQLITE_PATH = path.join(__dirname, '..', 'test.db');

let app;

beforeAll(() => {
  // Ensure fresh test DB
  if (fs.existsSync(process.env.SQLITE_PATH)) fs.unlinkSync(process.env.SQLITE_PATH);
  app = require('../src/server');
});

afterAll(() => {
  if (fs.existsSync(process.env.SQLITE_PATH)) fs.unlinkSync(process.env.SQLITE_PATH);
});

test('health check', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('CRUD items', async () => {
  const create = await request(app).post('/api/items').send({ name: 'First' });
  expect(create.status).toBe(201);
  expect(create.body.name).toBe('First');

  const list = await request(app).get('/api/items');
  expect(list.status).toBe(200);
  expect(list.body.length).toBe(1);

  const del = await request(app).delete(`/api/items/${create.body.id}`);
  expect(del.status).toBe(204);
});


