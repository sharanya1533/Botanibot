# GreenGrid — Water smarter, not harder

Weather-aware plant care: species-based watering schedules that **automatically
postpone outdoor watering when real rain is coming**.

---

## Problem Statement

Plant owners water by fixed habit. Overwatering kills more houseplants than
drought, and outdoor pots get watered right before a downpour wastes water and
drowns roots. GreenGrid builds each plant's schedule from its species' needs
and adjusts it against the actual weather forecast.

## Target Users

- **Balcony & terrace gardeners** coordinating watering across many pots.
- **Houseplant owners** who want species-correct intervals without research.
- **Anyone** who wants a care journal per plant, not a wall calendar.

## Solution

Pick a species (12 built-in care profiles), get a watering schedule. A cron
engine checks the forecast every 6 hours: if ≥5 mm of rain is forecast within
48 hours for an outdoor plant, its next watering is postponed by the rainy
days — with the reason shown. Watering resets the schedule; the journal and
timeline record every care action.

## Key Features

- **Species catalog** — 12 profiles (Basil every 2 days, Snake Plant every 14…)
  set the default interval; Custom species take a manual one.
- **Weather-aware engine** — OpenWeather integration with a **deterministic
  simulated fallback**, so every feature works offline and in tests. The UI
  always shows which source is live.
- **Decision logic** — only outdoor plants, only ≥5 mm days, only within the
  48-hour window; watering clears postponement.
- **Today board** — kanban of Overdue / Due today / Coming up / Postponed
  (rain), with moisture-ring gauges per plant.
- **Care timeline & growth journal** — water/fertilize/prune/repot events and
  monthly height notes with an SVG sparkline.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 4, React Router 6, Axios |
| Backend | Node.js, Express 4, Mongoose 8, Zod, node-cron |
| External API | OpenWeather 5-day forecast (graceful simulated fallback) |
| Auth | JWT (7-day), bcryptjs, rate-limited auth |
| Database | MongoDB (Atlas or local); `USE_MEMORY_DB=1` zero-config demo |
| Tests | `node:test` + `mongodb-memory-server` (17 checks incl. weather-decision tests) |
| Deployment | Render (backend `render.yaml`) + Vercel (frontend `vercel.json`) |

## Architecture

```text
React SPA (Vercel) — kanban today board, moisture rings, forecast strips
   │  axios + JWT bearer
   ▼
Express API (Render)
   │   /api/species         static care catalog (12 profiles)
   │   /api/plants          CRUD + events + journal (owner-guarded)
   │   /api/dashboard       grouped board + weather banner
   │   /api/jobs/run-weather  manual scan (demo/test; cron calls same fn)
   ▼
utils/weather.js — OpenWeather (5-day, rain mm/day) OR deterministic
                   simulated forecast (hash of city + day index)
jobs/scheduler.js — runWeatherScan(): postpone outdoor plants before rain
   ▼
MongoDB: User (city) · Plant (schedule, events, journal)
```

## Major Workflows

1. **Pot a plant** — pick a species + nickname + location/pot/light; the
   catalog sets the watering interval; the plant starts its schedule watered.
2. **Today board** — plants grouped by urgency with moisture-ring gauges;
   one-tap watering from any card.
3. **Rain postponement** — the engine postpones outdoor watering before rain
   and shows the reason on the plant ("Rain expected 12.4mm — skipped 2 days").
4. **Care timeline** — every water/fertilize/prune/repot recorded per plant.
5. **Growth journal** — monthly height + note upserted per month, drawn as a
   sparkline on the plant page.

## Local Setup

```bash
# 1. Backend
cd backend
npm install
npm test                       # 17-check suite (no database, no API key)

# Zero-config demo:
USE_MEMORY_DB=1 npm start      # API on http://localhost:5107

# Or with a real MongoDB:
cp .env.example .env           # set MONGODB_URI + JWT_SECRET
npm run seed
npm start

# 2. Frontend
cd ../frontend
npm install
npm run dev                    # app on http://localhost:5307
```

**Demo credentials**: `veda@demo.com` / `Demo@1234` (city: Bengaluru). Seed
includes 6 plants — one overdue, one due today, one postponed by "rain" —
plus a 3-month tomato growth journal. Trigger a live scan with
`curl -X POST localhost:5107/api/jobs/run-weather`.

## Environment Variables

### backend/.env

| Name | Purpose |
|---|---|
| `PORT` | API port (default 5107) |
| `MONGODB_URI` | MongoDB connection string (empty + `USE_MEMORY_DB=1` for demo mode) |
| `USE_MEMORY_DB` | `1` = ephemeral in-memory MongoDB, auto-seeded on boot |
| `JWT_SECRET` | Secret used to sign JWTs — long random string in production |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS (default http://localhost:5307) |
| `OPENWEATHER_API_KEY` | Optional. Without it a deterministic simulated forecast is used. |

### frontend/.env

| Name | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL (default http://localhost:5107/api) |

## API Overview

| Method & path | Purpose |
|---|---|
| `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` | Auth (city stored on user) |
| `GET /api/species` | Care catalog |
| `POST/GET /api/plants` · `GET/PATCH/DELETE /api/plants/:id` | Plant CRUD (owner-guarded) |
| `POST /api/plants/:id/events` | water / fertilize / prune / repot |
| `POST /api/plants/:id/journal` | Monthly growth upsert |
| `GET /api/dashboard` | Grouped today board + weather banner |
| `POST /api/jobs/run-weather` | Manual weather scan |
| `GET /api/health` | Health probe |

## Deployment

- **Backend**: Render web service from `backend/render.yaml`; set `MONGODB_URI`,
  `JWT_SECRET`, `CLIENT_ORIGIN` (and optionally `OPENWEATHER_API_KEY`); health
  check `/api/health`. The 6-hour cron starts with the server.
- **Frontend**: Vercel from `frontend/` (SPA rewrite); set `VITE_API_URL`.

Live links: backend — [add URL] · frontend — [add URL]

## Error Handling & Security

- Zod validation everywhere; custom species without an interval are rejected
  with a clear message; journal months must match `YYYY-MM`.
- Ownership enforced in queries — another user's plant 403s on every action.
- External API failures degrade gracefully to the simulated forecast (logged,
  surfaced in the UI banner) rather than breaking schedules.
- bcrypt(12) hashing, no account enumeration, rate-limited auth, 7-day JWTs.
- Frontend handles loading/empty/error/success states; toasts on all actions;
  401 auto-logout.

## Roadmap

- Photo per journal entry.
- Fertilizing schedules alongside watering.
- Multi-city balconies per user.
- Community species catalog contributions.
