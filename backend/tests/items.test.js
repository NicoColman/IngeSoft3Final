const request = require('supertest');
const { app, getPool, query } = require('../src/server');

process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || 5432;
process.env.DB_NAME = process.env.DB_NAME || 'ingsoft3_test';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

beforeAll(async () => {
  try {
    await query('DROP TABLE IF EXISTS items');
    await query(`
      CREATE TABLE items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);
  } catch (err) {
    console.error('Test DB setup error:', err);
  }
});

afterAll(async () => {
  const pool = getPool();
  try {
    await query('DROP TABLE IF EXISTS items');
    await pool.end();
  } catch (err) {
    console.error('Test cleanup error:', err);
  }
});

beforeEach(async () => {
  await query('DELETE FROM items');
});

test('verificación de estado', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
}, 10000);

test('operaciones CRUD de items', async () => {
  const create = await request(app).post('/api/items').send({ name: 'First' });
  expect(create.status).toBe(201);
  expect(create.body.name).toBe('First');
  expect(create.body.id).toBeDefined();

  const list = await request(app).get('/api/items');
  expect(list.status).toBe(200);
  expect(list.body.length).toBe(1);
  expect(list.body[0].name).toBe('First');

  const del = await request(app).delete(`/api/items/${create.body.id}`);
  expect(del.status).toBe(204);

  const listAfter = await request(app).get('/api/items');
  expect(listAfter.status).toBe(200);
  expect(listAfter.body.length).toBe(0);
}, 10000);

test('eliminar todos los items', async () => {
  await request(app).post('/api/items').send({ name: 'Item 1' });
  await request(app).post('/api/items').send({ name: 'Item 2' });

  const listBefore = await request(app).get('/api/items');
  expect(listBefore.body.length).toBe(2);

  const clear = await request(app).delete('/api/items');
  expect(clear.status).toBe(204);

  const listAfter = await request(app).get('/api/items');
  expect(listAfter.body.length).toBe(0);
}, 10000);


test('debería retornar 400 si falta el nombre', async () => {
  const res = await request(app).post('/api/items').send({});
  expect(res.status).toBe(400);
});

test('debería retornar 404 al eliminar un item inexistente', async () => {
  const res = await request(app).delete('/api/items/9999');
  expect(res.status).toBe(404); 
});

test('debería retornar 400 al eliminar con formato de ID inválido', async () => {
  const res = await request(app).delete('/api/items/abc');
  expect(res.status).toBe(400);
});

test('debería sanitizar la entrada (verificación de Inyección SQL)', async () => {
  const maliciousName = "'; DROP TABLE items; --";
  
  const create = await request(app).post('/api/items').send({ name: maliciousName });
  expect(create.status).toBe(201); 
  
  const list = await request(app).get('/api/items');
  expect(list.status).toBe(200);
  expect(list.body[0].name).toBe(maliciousName); 
});