import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen overflow-hidden">
      <span className="leaf-float absolute left-[6%] top-24 text-5xl opacity-50">🌿</span>
      <span className="leaf-float absolute right-[8%] top-48 text-4xl opacity-40" style={{ animationDelay: '-3s' }}>🍃</span>
      <span className="leaf-float absolute bottom-32 left-[12%] text-3xl opacity-30" style={{ animationDelay: '-5s' }}>🪴</span>

      <header className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="serif flex items-center gap-2.5 text-xl font-bold">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-leaf text-lg text-white shadow-lg shadow-leaf/30">☘</span> GreenGrid
        </Link>
        <Link to={user ? '/garden' : '/register'} className="rounded-full bg-leaf px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-leaf/30 transition hover:-translate-y-0.5">
          {user ? 'Open my garden' : 'Start free'}
        </Link>
      </header>

      <main className="relative mx-auto max-w-6xl px-4">
        <section className="reveal py-14 text-center sm:py-20">
          <p className="serif mx-auto mb-5 inline-block rounded-full bg-leaf-soft px-5 py-1.5 text-sm italic text-leaf">~ weather-aware plant care ~</p>
          <h1 className="serif mx-auto max-w-3xl text-5xl font-bold leading-[1.08] sm:text-7xl">
            Water smarter,<br /><span className="italic text-leaf">not harder</span><span className="text-terra">.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-stone-500">
            Overwatering kills more houseplants than drought — and outdoor pots get
            watered right before downpours. GreenGrid schedules every plant and
            skips watering when the sky is about to do it for you.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-3d hover-lift rounded-full bg-leaf px-9 py-4 font-medium text-white shadow-xl shadow-leaf/30">Plant your first pot →</Link>
            <Link to="/login" className="btn-3d glass tilt-card rounded-full px-9 py-4 font-medium text-stone-700">I have a garden</Link>
          </div>
        </section>

        {/* moisture-ring demo */}
        <section className="reveal mx-auto mb-12 max-w-3xl">
          <div className="float-3d glass tilt-card rounded-[2.5rem] p-8">
            <p className="serif text-center text-sm italic text-stone-400">today in the garden</p>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              {[
                ['Cherry Rocket', 'overdue by 2d', 'bg-terra', '38%', '🍅'],
                ['Peace Lily', 'due in 4h', 'bg-amber-500', '82%', '🌸'],
                ['Sir Stripes', 'in 10 days', 'bg-leaf', '12%', '🌵'],
              ].map(([name, when, color, fill, icon]) => (
                <div key={name} className="rounded-3xl border border-sand bg-white p-4 hover-lift">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full" style={{ background: `conic-gradient(${color === 'bg-terra' ? '#c2410c' : color === 'bg-amber-500' ? '#f59e0b' : '#4d7c0f'} ${fill}, #e5ddc8 0)` }}>
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-2xl">{icon}</span>
                  </div>
                  <p className="serif mt-3 font-bold">{name}</p>
                  <p className={`text-xs ${when.includes('overdue') ? 'text-terra font-bold' : 'text-stone-400'}`}>{when}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-2xl bg-sky-50 px-4 py-3 text-center text-sm text-sky-700">🌧️ Rain Tuesday (12.4mm) — outdoor watering postponed 2 days</p>
          </div>
        </section>

        <section className="reveal grid gap-5 pb-16 sm:grid-cols-3">
          {[
            ['🌱', 'Species-smart schedules', 'Twelve built-in care profiles — from thirsty basil to drought-loving snake plants.'],
            ['🌧️', 'Rain-aware engine', 'A cron checks the forecast every 6 hours and postpones outdoor watering before rain.'],
            ['📈', 'Growth journal', 'Monthly height notes and a care timeline — watch progress, remember what worked.'],
          ].map(([icon, t, b]) => (
            <div key={t} className="rounded-3xl border border-sand bg-white/80 p-7 hover-lift">
              <span className="text-3xl">{icon}</span>
              <h3 className="serif mt-3 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{b}</p>
            </div>
          ))}
        </section>
      </main>

      <div className="border-y border-sand bg-white/70 py-4">
        <div className="marquee gap-10 text-sm font-medium text-leaf/60">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex gap-10 pr-10">
              {['OPENWEATHER INTEGRATION', 'RAIN POSTPONEMENT', '12 SPECIES PROFILES', 'GROWTH JOURNALS', 'CARE TIMELINES'].map((t) => (
                <span key={t} className="flex items-center gap-10">{t} <span className="text-terra">❧</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="py-10 text-center text-sm text-stone-400">GreenGrid — water smarter, not harder.</footer>
    </div>
  );
}
