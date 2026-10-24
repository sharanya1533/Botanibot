// Forecast provider with a deterministic simulated fallback.
// With OPENWEATHER_API_KEY: real 5-day forecast from OpenWeather.
// Without: a stable pseudo-random forecast derived from the city name + day
// index, so demos and tests always work offline and repeatable.

const dayMs = 24 * 60 * 60 * 1000;

function hashString(s) {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministic LCG — same city + day => same weather, forever.
function simulatedForecast(city, days = 5, now = Date.now()) {
  const base = hashString(city.toLowerCase());
  const out = [];
  for (let i = 0; i < days; i++) {
    const dayIndex = Math.floor((now + i * dayMs) / dayMs);
    let seed = (base ^ Math.imul(dayIndex, 2654435761)) >>> 0;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const roll = (seed % 100) / 100; // 0..0.99
    const rainMm = roll > 0.72 ? Math.round(roll * 22 * 10) / 10 : 0; // ~28% chance of rain
    out.push({
      date: new Date(now + i * dayMs).toISOString().slice(0, 10),
      rainMm,
      source: 'simulated',
    });
  }
  return out;
}

async function realForecast(city, apiKey) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`,
    { signal: AbortSignal.timeout(5000) }
  );
  if (!res.ok) throw new Error(`OpenWeather responded ${res.status}`);
  const data = await res.json();
  // aggregate 3-hour buckets into daily rain totals (mm)
  const byDay = new Map();
  for (const row of data.list || []) {
    const day = row.dt_txt.slice(0, 10);
    const mm = (row.rain && row.rain['3h']) || 0;
    byDay.set(day, (byDay.get(day) || 0) + mm);
  }
  return [...byDay.entries()].slice(0, 5).map(([date, mm]) => ({
    date,
    rainMm: Math.round(mm * 10) / 10,
    source: 'openweather',
  }));
}

async function getForecast(city) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (apiKey) {
    try {
      return await realForecast(city, apiKey);
    } catch (err) {
      console.warn(`OpenWeather failed (${err.message}) — falling back to simulated forecast`);
    }
  }
  return simulatedForecast(city);
}

module.exports = { getForecast, simulatedForecast, hashString };
