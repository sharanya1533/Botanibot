const Plant = require('../models/Plant.model');
const asyncHandler = require('../utils/asyncHandler');

// Watering streak: consecutive days (ending today/yesterday) with ≥1 watering.
function wateringStreak(dates, now = new Date()) {
  const daySet = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)));
  const key = (offset) => {
    const d = new Date(now); d.setDate(d.getDate() - offset);
    return d.toISOString().slice(0, 10);
  };
  let streak = 0;
  let offset = daySet.has(key(0)) ? 0 : 1;
  while (daySet.has(key(offset))) { streak += 1; offset += 1; }
  return streak;
}

const TIPS = [
  'Water early morning — leaves dry by nightfall and fungus stays away.',
  'Yellow lower leaves usually mean overwatering, not hunger.',
  'Terracotta pots breathe — plants in them dry out ~30% faster.',
  'Brown leaf tips? Your air is probably too dry, not your soil.',
  'Rotate a sun-chasing plant a quarter turn every week for even growth.',
  'Bottom-watering succulents prevents rosette rot.',
];

exports.gardenStats = asyncHandler(async (req, res) => {
  const plants = await Plant.find({ owner: req.user.id });
  const allEvents = plants.flatMap((p) => p.events || []);
  const waterings = allEvents.filter((e) => e.type === 'water');
  const totalLitres = Math.round(waterings.reduce((s, e) => s + (e.amountMl || 0), 0) / 100) / 10;
  const rainSkipped = plants.filter((p) => p.postponedDays > 0);
  const rainwaterSaved = Math.round(rainSkipped.reduce((s, p) => s + p.postponedDays * 250, 0) / 100) / 10;
  const streak = wateringStreak(waterings.map((e) => e.at));
  const bySpecies = {};
  for (const p of plants) bySpecies[p.species] = (bySpecies[p.species] || 0) + 1;

  res.json({
    plants: plants.length,
    waterings: waterings.length,
    totalLitres,
    streak,
    rainwaterSavedLitres: rainwaterSaved,
    rainSkips: rainSkipped.length,
    bySpecies,
    tip: TIPS[new Date().getDate() % TIPS.length],
  });
});

exports.wateringStreak = wateringStreak;
