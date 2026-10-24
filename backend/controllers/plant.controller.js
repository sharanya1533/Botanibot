const { z } = require('zod');
const Plant = require('../models/Plant.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const SPECIES = require('../utils/species');
const { getForecast } = require('../utils/weather');
const { runWeatherScan } = require('../jobs/scheduler');

const dayMs = 24 * 60 * 60 * 1000;

const plantSchema = z.object({
  species: z.string().trim().min(2, 'Pick or name a species').max(60),
  nickname: z.string().trim().min(1, 'Give your plant a nickname').max(60),
  intervalDays: z.coerce.number().int().min(1, 'Interval is 1-60 days').max(60).optional(),
  potType: z.enum(['terracotta', 'plastic', 'ceramic']).default('plastic'),
  location: z.enum(['indoor', 'outdoor']).default('indoor'),
  sunLevel: z.enum(['low', 'medium', 'bright']).default('medium'),
});

const eventSchema = z.object({
  type: z.enum(['water', 'fertilize', 'prune', 'repot']),
  note: z.string().trim().max(200).optional(),
  amountMl: z.coerce.number().min(0).max(10000).optional(),
});

const journalSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must look like YYYY-MM'),
  heightCm: z.coerce.number().min(0).max(1000).optional(),
  note: z.string().trim().max(300).optional(),
});

async function requirePlant(id, userId) {
  const plant = await Plant.findById(id);
  if (!plant) throw new AppError(404, 'Plant not found');
  if (String(plant.owner) !== String(userId)) throw new AppError(403, 'This plant belongs to someone else');
  return plant;
}

exports.species = asyncHandler(async (_req, res) => {
  res.json(SPECIES.filter((s) => s.name !== 'Custom'));
});

exports.create = asyncHandler(async (req, res) => {
  const parsed = plantSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const data = parsed.data;
  // Species catalog provides the default interval unless overridden (Custom)
  const catalog = SPECIES.find((s) => s.name.toLowerCase() === data.species.toLowerCase());
  const intervalDays = data.intervalDays || catalog?.intervalDays;
  if (!intervalDays) throw new AppError(400, 'Custom species need an intervalDays value');

  const plant = await Plant.create({
    ...data,
    species: catalog?.name || data.species,
    intervalDays,
    owner: req.user.id,
    lastWateredAt: new Date(),
    nextDueAt: new Date(Date.now() + intervalDays * dayMs),
    events: [{ type: 'water', note: 'Initial watering on creation', amountMl: 250 }],
  });
  res.status(201).json(plant);
});

exports.list = asyncHandler(async (req, res) => {
  const plants = await Plant.find({ owner: req.user.id }).sort('nextDueAt');
  res.json(plants);
});

exports.getOne = asyncHandler(async (req, res) => {
  const plant = await requirePlant(req.params.id, req.user.id);
  const forecast = await getForecast(req.user.city || 'Bengaluru');
  res.json({ ...plant.toObject(), forecast: forecast.slice(0, 5) });
});

exports.update = asyncHandler(async (req, res) => {
  const parsed = plantSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const plant = await requirePlant(req.params.id, req.user.id);
  const before = { location: plant.location, intervalDays: plant.intervalDays };
  Object.assign(plant, parsed.data);
  // Moving outdoors (or changing the interval) re-evaluates against the forecast
  const movedOutdoors = before.location === 'indoor' && plant.location === 'outdoor';
  if (movedOutdoors || (parsed.data.intervalDays && parsed.data.intervalDays !== before.intervalDays)) {
    plant.nextDueAt = new Date((plant.lastWateredAt || plant.createdAt).getTime() + plant.intervalDays * dayMs);
    plant.postponedDays = 0;
    plant.postponeReason = undefined;
    if (plant.location === 'outdoor') await runWeatherScan(new Date(), getForecast);
    await plant.save();
  }
  await plant.save();
  res.json(plant);
});

exports.remove = asyncHandler(async (req, res) => {
  const plant = await requirePlant(req.params.id, req.user.id);
  await plant.deleteOne();
  res.json({ deleted: true });
});

exports.addEvent = asyncHandler(async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const plant = await requirePlant(req.params.id, req.user.id);
  plant.events.push({ type: parsed.data.type, note: parsed.data.note, amountMl: parsed.data.amountMl, at: new Date() });
  if (parsed.data.type === 'water') {
    plant.lastWateredAt = new Date();
    plant.nextDueAt = new Date(Date.now() + plant.intervalDays * dayMs);
    plant.postponedDays = 0;
    plant.postponeReason = undefined;
  }
  await plant.save();
  res.status(201).json(plant);
});

exports.addJournal = asyncHandler(async (req, res) => {
  const parsed = journalSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const plant = await requirePlant(req.params.id, req.user.id);
  const existing = plant.journal.find((j) => j.month === parsed.data.month);
  if (existing) {
    if (parsed.data.heightCm !== undefined) existing.heightCm = parsed.data.heightCm;
    if (parsed.data.note !== undefined) existing.note = parsed.data.note;
  } else {
    plant.journal.push(parsed.data);
  }
  plant.journal.sort((a, b) => a.month.localeCompare(b.month));
  await plant.save();
  res.json(plant);
});

// Today board: Overdue / Due today / Coming up / Postponed (rain)
exports.dashboard = asyncHandler(async (req, res) => {
  const plants = await Plant.find({ owner: req.user.id });
  const forecast = await getForecast(req.user.city || 'Bengaluru');
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const groups = { overdue: [], dueToday: [], comingUp: [], postponed: [] };
  for (const p of plants) {
    if (p.postponeReason && p.postponedDays > 0) groups.postponed.push(p);
    else if (p.nextDueAt < now) groups.overdue.push(p);
    else if (p.nextDueAt < endOfDay) groups.dueToday.push(p);
    else groups.comingUp.push(p);
  }
  const byDue = (a, b) => new Date(a.nextDueAt) - new Date(b.nextDueAt);
  Object.values(groups).forEach((g) => g.sort(byDue));

  const rainySoon = forecast.filter((f) => f.rainMm >= 5).slice(0, 1);
  res.json({
    groups,
    counts: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])),
    weather: {
      city: req.user.city || 'Bengaluru',
      source: forecast[0]?.source || 'simulated',
      rainAlert: rainySoon[0] ? `${rainySoon[0].rainMm}mm rain on ${rainySoon[0].date}` : null,
      forecast: forecast.slice(0, 5),
    },
  });
});
