import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="serif flex items-center gap-2 text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf text-sm text-white">☘</span> GreenGrid
        </Link>
        <Link to={user ? '/garden' : '/register'} className="rounded-full bg-leaf px-5 py-2 text-sm font-medium text-white">
          {user ? 'Open my garden' : 'Start free'}
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-4">
        <section className="py-24 text-center">
          <p className="mx-auto mb-4 w-fit rounded-full bg-leaf-soft px-4 py-1 text-sm font-medium text-leaf">Weather-aware plant care</p>
          <h1 className="serif mx-auto max-w-2xl text-5xl font-bold leading-tight">
            Water smarter, <span className="italic text-leaf">not harder</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-stone-500">
            Overwatering kills more houseplants than drought — and outdoor pots get
            watered right before downpours. GreenGrid schedules every plant and
            skips watering when the sky is about to do it for you.
          </p>
          <div className="mt-9 flex justify-center gap-3">
            <Link to="/register" className="rounded-full bg-leaf px-8 py-3 font-medium text-white shadow-lg shadow-leaf/20">Plant your first pot</Link>
            <Link to="/login" className="rounded-full border border-sand px-8 py-3 font-medium text-stone-600 hover:border-leaf">I have a garden</Link>
          </div>
        </section>
        <section className="grid gap-4 pb-24 sm:grid-cols-3">
          {[
            ['Species-smart schedules', 'Twelve built-in care profiles set sensible watering intervals — from thirsty basil to drought-loving snake plants.'],
            ['Rain-aware', 'A cron engine checks the forecast every 6 hours and postpones outdoor watering when real rain is coming.'],
            ['Growth journal', 'Monthly height notes and a care timeline per plant — watch progress, remember what worked.'],
          ].map(([t, b]) => (
            <div key={t} className="rounded-3xl border border-sand bg-white p-6">
              <h3 className="serif text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{b}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t border-sand py-6 text-center text-sm text-stone-400">GreenGrid — water smarter, not harder.</footer>
    </div>
  );
}
