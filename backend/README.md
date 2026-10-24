# GreenGrid backend

Express + Mongoose API for GreenGrid. See the repo root README for the full product overview.

- `npm start` — production start (weather cron every 6h)
- `npm run dev` — watch mode
- `npm test` — 17-check smoke suite incl. weather-decision tests (in-memory MongoDB)
- `npm run seed` — seed demo data into `MONGODB_URI`
- `npm run atlas-check` — verify the Atlas connection string

Zero-config demo: `USE_MEMORY_DB=1 npm start` boots an ephemeral database,
seeds it if empty, and logs the demo credentials. Manual weather scan:
`curl -X POST localhost:5107/api/jobs/run-weather`. Without
OPENWEATHER_API_KEY the app uses a deterministic simulated forecast.
