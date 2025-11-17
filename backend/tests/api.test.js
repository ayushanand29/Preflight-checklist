const request = require('supertest');
const fs = require('fs');
const path = require('path');

let app;
let createdId;

const DATA_FILE = path.resolve(__dirname, 'test-data.json');

beforeAll(() => {
  // set DATA_FILE before requiring the app so server uses the test file
  process.env.DATA_FILE = DATA_FILE;

  if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE);
  fs.writeFileSync(DATA_FILE, '[]');

  app = require('../server');
});

afterAll(() => {
  // cleanup
  try {
    if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE);
  } catch (e) {
    // ignore
  }
});

test('GET /api/checklist returns empty array initially', async () => {
  const res = await request(app).get('/api/checklist');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(0);
});

test('POST /api/checklist creates an item', async () => {
  const payload = { check: 'Check A', status: 'pending', comment: '' };
  const res = await request(app).post('/api/checklist').send(payload);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('id');
  expect(res.body.check).toBe(payload.check);
  createdId = res.body.id;
});

test('PUT /api/checklist/:id updates the item', async () => {
  const res = await request(app).put(`/api/checklist/${createdId}`).send({ status: 'done', comment: 'ok' });
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('done');
  expect(res.body.comment).toBe('ok');
});

test('PUT /api/checklist/:id for non-existent id returns 404', async () => {
  const res = await request(app).put('/api/checklist/99999999999').send({ status: 'x' });
  expect(res.status).toBe(404);
});

test('DELETE /api/checklist/:id deletes the item', async () => {
  const res = await request(app).delete(`/api/checklist/${createdId}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('message', 'Deleted');

  const get = await request(app).get('/api/checklist');
  expect(get.status).toBe(200);
  expect(get.body.find(x => x.id === createdId)).toBeUndefined();
});
