const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Plant = require('../models/Plant.model');

const DEMO_PASSWORD = 'Demo@1234';

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const veda = await User.create({ name: 'Veda Krishnan', email: 'veda@demo.com', passwordHash: hash, city: 'Bengaluru' });

  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const daysFromNow = (d) => new Date(now + d * dayMs);
  const daysAgo = (d) => new Date(now - d * dayMs);

  const mk = (species, nickname, intervalDays, location, sunLevel, lastWatered, nextDue, extra = {}) =>
    Plant.create({
      owner: veda._id, species, nickname, intervalDays, location, sunLevel,
      potType: location === 'outdoor' ? 'terracotta' : 'plastic',
      lastWateredAt: lastWatered, nextDueAt: nextDue,
      events: [{ type: 'water', note: 'seeded history', amountMl: 300, at: lastWatered }], ...extra,
    });

  // 2 outdoor (one overdue, one due today), indoor mix
  await mk('Hibiscus', 'Balcony Rani', 3, 'outdoor', 'bright', daysAgo(5), daysAgo(2));           // overdue
  await mk('Tomato', 'Cherry Rocket', 2, 'outdoor', 'bright', daysAgo(2), daysFromNow(0.4));      // due today
  await mk('Basil', 'Pesto', 2, 'outdoor', 'bright', daysAgo(1), daysFromNow(1));
  await mk('Snake Plant', 'Sir Stripes', 14, 'indoor', 'low', daysAgo(4), daysFromNow(10));
  await mk('Peace Lily', 'Drama Queen', 5, 'indoor', 'medium', daysAgo(4), daysFromNow(1));
  await mk('Money Plant', 'Money Heist', 7, 'indoor', 'low', daysAgo(6), daysFromNow(1), {
    postponedDays: 2, postponeReason: 'Rain expected (12.4mm) — watering skipped 2 days',        // postponed by rain
  });

  // growth journal for sparkline
  const tomato = await Plant.findOne({ nickname: 'Cherry Rocket' });
  tomato.journal = [
    { month: '2026-08', heightCm: 22, note: 'First flowers' },
    { month: '2026-09', heightCm: 35, note: 'Staked the vine' },
    { month: '2026-10', heightCm: 48, note: 'Three green tomatoes' },
  ];
  await tomato.save();

  return { veda };
}

module.exports = seed;
module.exports.DEMO_PASSWORD = DEMO_PASSWORD;
