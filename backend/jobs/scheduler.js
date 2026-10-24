const cron = require('node-cron');
const Plant = require('../models/Plant.model');
const User = require('../models/User.model');
const { getForecast } = require('../utils/weather');

const RAIN_THRESHOLD_MM = 5;
const RAIN_WINDOW_DAYS = 2;

// Re-evaluate every outdoor plant against the forecast. Injectable forecast
// lookup makes the decision logic unit-testable.
async function runWeatherScan(now = new Date(), forecastFor = getForecast) {
  let postponed = 0;
  const plants = await Plant.find({ location: 'outdoor' }).populate('owner', 'city');
  for (const plant of plants) {
    const city = plant.owner?.city || 'Bengaluru';
    const forecast = await forecastFor(city);
    const windowEnd = now.getTime() + RAIN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const dueSoonOrOverdue = plant.nextDueAt <= new Date(windowEnd);

    if (dueSoonOrOverdue) {
      const rainyDays = forecast.filter(
        (f) => f.rainMm >= RAIN_THRESHOLD_MM && new Date(f.date) <= new Date(windowEnd)
      );
      if (rainyDays.length > 0 && plant.lastWateredAt && plant.nextDueAt > now) {
        // postpone by the number of rainy days (max 3) — nature waters for free
        const extra = Math.min(rainyDays.length, 3);
        plant.nextDueAt = new Date(plant.nextDueAt.getTime() + extra * 24 * 60 * 60 * 1000);
        plant.postponedDays = extra;
        plant.postponeReason = `Rain expected (${Math.max(...rainyDays.map((r) => r.rainMm))}mm) — watering skipped ${extra} day${extra > 1 ? 's' : ''}`;
        await plant.save();
        postponed += 1;
      } else if (rainyDays.length > 0 && plant.nextDueAt <= now) {
        // already overdue: still skip the rain days, note it
        plant.postponedDays = 0;
        plant.postponeReason = `Overdue, but rain today (${rainyDays[0].rainMm}mm) will cover it`;
        await plant.save();
        postponed += 1;
      }
    }
  }
  return { postponed, checked: plants.length };
}

function startScheduler() {
  // every 6 hours
  return cron.schedule('0 */6 * * *', () => {
    runWeatherScan().catch((err) => console.error('Weather scan failed:', err.message));
  });
}

module.exports = { runWeatherScan, startScheduler, RAIN_THRESHOLD_MM, RAIN_WINDOW_DAYS };
