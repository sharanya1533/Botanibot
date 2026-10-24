const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { startTest, stopTest, api, login } = require('./helpers');
const { simulatedForecast } = require('../utils/weather');
const { runWeatherScan, RAIN_THRESHOLD_MM } = require('../jobs/scheduler');

let ctx, veda;
const dayMs = 24 * 60 * 60 * 1000;

before(async () => {
  ctx = await startTest();
  veda = await login(ctx, 'veda@demo.com');
});

after(async () => stopTest(ctx));

// ---- weather engine unit tests ------------------------------------------
test('simulated forecast is deterministic for the same city and day', () => {
  const a1 = simulatedForecast('Bengaluru');
  const a2 = simulatedForecast('Bengaluru');
  assert.deepEqual(a1, a2);
});

test('simulated forecast differs across cities', () => {
  const bengaluru = simulatedForecast('Bengaluru');
  const jodhpur = simulatedForecast('Jodhpur');
  assert.notDeepEqual(bengaluru, jodhpur);
});

test('forecast entries carry rain amounts and a source', () => {
  const f = simulatedForecast('Chennai');
  assert.equal(f.length, 5);
  assert.ok(f.every((d) => d.rainMm >= 0));
  assert.equal(f[0].source, 'simulated');
});

test('weather scan postpones outdoor plants when rain is coming', async () => {
  const Plant = require('../models/Plant.model');
  const rainy = [{ date: new Date(Date.now() + dayMs).toISOString().slice(0, 10), rainMm: 12, source: 'simulated' }];
  const before = await Plant.findOne({ nickname: 'Pesto' }); // outdoor, due tomorrow, recently watered
  const result = await runWeatherScan(new Date(), async () => rainy);
  assert.ok(result.postponed >= 1);
  const after = await Plant.findById(before._id);
  assert.equal(after.postponedDays, 1);
  assert.ok(after.postponeReason.includes('Rain expected'));
  assert.ok(new Date(after.nextDueAt) > new Date(before.nextDueAt));
});

test('weather scan never touches indoor plants', async () => {
  const Plant = require('../models/Plant.model');
  const rainy = [{ date: new Date().toISOString().slice(0, 10), rainMm: 50, source: 'simulated' }];
  await runWeatherScan(new Date(), async () => rainy);
  const indoor = await Plant.findOne({ nickname: 'Sir Stripes' });
  assert.equal(indoor.postponedDays, 0);
  assert.ok(!indoor.postponeReason);
});

test('rain below the threshold does not postpone', async () => {
  const Plant = require('../models/Plant.model');
  const basil = await Plant.findOne({ nickname: 'Pesto' });
  basil.nextDueAt = new Date(Date.now() + 12 * 3600 * 1000);
  basil.postponedDays = 0;
  basil.postponeReason = undefined;
  await basil.save();
  const drizzle = [{ date: new Date().toISOString().slice(0, 10), rainMm: RAIN_THRESHOLD_MM - 1, source: 'simulated' }];
  const result = await runWeatherScan(new Date(), async () => drizzle);
  const after = await Plant.findById(basil._id);
  assert.equal(after.postponedDays, 0);
  assert.ok(result.postponed === 0 || !after.postponeReason);
});

// ---- health & auth -------------------------------------------------------
test('health endpoint responds ok', async () => {
  const r = await api(ctx, 'GET', '/health');
  assert.equal(r.status, 200);
});

test('login rejects wrong password with 401', async () => {
  const r = await api(ctx, 'POST', '/auth/login', { body: { email: 'veda@demo.com', password: 'nope@123' } });
  assert.equal(r.status, 401);
});

test('plants require auth (401)', async () => {
  const r = await api(ctx, 'GET', '/plants');
  assert.equal(r.status, 401);
});

// ---- plants --------------------------------------------------------------
test('species catalog lists care profiles without Custom', async () => {
  const r = await api(ctx, 'GET', '/species', { token: veda.token });
  assert.equal(r.status, 200);
  assert.ok(r.body.length >= 10);
  assert.ok(!r.body.some((s) => s.name === 'Custom'));
});

test('creating a plant inherits the species interval and starts due in the future', async () => {
  const r = await api(ctx, 'POST', '/plants', { token: veda.token, body: { species: 'Snake Plant', nickname: 'Little Fang', location: 'indoor' } });
  assert.equal(r.status, 201);
  assert.equal(r.body.intervalDays, 14);
  assert.ok(new Date(r.body.nextDueAt) > new Date());
});

test('custom species without an interval is rejected (400)', async () => {
  const r = await api(ctx, 'POST', '/plants', { token: veda.token, body: { species: 'Dragon Tree', nickname: 'Puff', location: 'indoor' } });
  assert.equal(r.status, 400);
});

test('watering resets the schedule and clears postponement', async () => {
  const list = await api(ctx, 'GET', '/plants', { token: veda.token });
  const money = list.body.find((p) => p.nickname === 'Money Heist'); // postponed by rain in seed
  const r = await api(ctx, 'POST', `/plants/${money._id}/events`, { token: veda.token, body: { type: 'water', amountMl: 200 } });
  assert.equal(r.status, 201);
  assert.equal(r.body.postponedDays, 0);
  assert.ok(!r.body.postponeReason);
  const expected = new Date(Date.now() + 7 * dayMs).getTime();
  assert.ok(Math.abs(new Date(r.body.nextDueAt) - expected) < dayMs, 'next due ≈ interval days away');
});

test('dashboard groups plants and reports the weather source', async () => {
  const r = await api(ctx, 'GET', '/dashboard', { token: veda.token });
  assert.equal(r.status, 200);
  assert.ok(r.body.groups.overdue.some((p) => p.nickname === 'Balcony Rani'));
  assert.ok(r.body.counts.overdue >= 1);
  assert.ok(['simulated', 'openweather'].includes(r.body.weather.source));
  assert.ok(Array.isArray(r.body.weather.forecast));
});

test('journal upserts by month and sorts chronologically', async () => {
  const list = await api(ctx, 'GET', '/plants', { token: veda.token });
  const tomato = list.body.find((p) => p.nickname === 'Cherry Rocket');
  const r = await api(ctx, 'POST', `/plants/${tomato._id}/journal`, { token: veda.token, body: { month: '2026-09', heightCm: 37, note: 'corrected' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.journal.find((j) => j.month === '2026-09').heightCm, 37);
  const months = r.body.journal.map((j) => j.month);
  assert.deepEqual(months, [...months].sort());
});

test('another user cannot water someone else\'s plant (403)', async () => {
  const reg = await api(ctx, 'POST', '/auth/register', { body: { name: 'Other Gardener', email: 'gardener@example.com', password: 'Garden@123' } });
  const list = await api(ctx, 'GET', '/plants', { token: veda.token });
  const r = await api(ctx, 'POST', `/plants/${list.body[0]._id}/events`, { token: reg.body.token, body: { type: 'water' } });
  assert.equal(r.status, 403);
});

test('unknown plant returns structured 404', async () => {
  const r = await api(ctx, 'GET', `/plants/${'0'.repeat(24)}`, { token: veda.token });
  assert.equal(r.status, 404);
});
