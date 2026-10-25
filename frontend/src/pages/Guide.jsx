import SceneBackground from '../components/SceneBackground.jsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';

const STEPS = [
    ['1', 'Add plants', 'Pick a species (12 built-in profiles set the interval) — nickname, location, pot type, sun level.'],
    ['2', 'Let the engine work', 'A cron checks the forecast every 6 hours (real OpenWeather data) and postpones outdoor watering before rain.'],
    ['3', 'Today board', 'Plants grouped by urgency: Overdue / Due today / Coming up / Postponed (rain) — with moisture ring gauges.'],
    ['4', 'Record care', 'One-tap watering, fertilize, prune, repot. Every event lands on the plant’s timeline.'],
    ['5', 'Growth journal', 'Monthly height notes draw a sparkline — watch progress, remember what worked.'],
  ];

export default function Guide() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen">
      <SceneBackground />
      <Navbar />
      <main className="relative mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.35em] opacity-60">1-minute guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          How GreenGrid works
        </h1>
        <p className="mt-2 text-lg opacity-60">Solar-aware energy planning for smart homes</p>

        <ol className="mt-10 space-y-4">
          {STEPS.map(([n, title, body], i) => (
            <li key={n} className="card tilt-card flex gap-5 p-5" style={{ animation: `fadeUp .6s ${i * 0.07}s both` }}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-bold"
                style={{ background: 'var(--glow, rgba(0,0,0,.06))', color: 'inherit' }}>{n}</span>
              <div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed opacity-70">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex gap-3">
          <Link to="/" className="rounded-full px-7 py-3 font-bold transition hover:opacity-80"
            style={{ background: 'var(--glow, #333)', color: '#fff' }}>Back to home →</Link>
        </div>
      </main>
    </div>
  );
}
