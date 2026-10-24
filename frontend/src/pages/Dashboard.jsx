import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, Empty, ErrorState } from '../components/states.jsx';
import { MoistureRing, dueLabel } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const COLUMNS = [
  ['overdue', 'Overdue', 'border-terra/30 bg-terra/5', 'water now'],
  ['dueToday', 'Due today', 'border-amber-300 bg-amber-50', 'due soon'],
  ['comingUp', 'Coming up', 'border-sand bg-white', 'on schedule'],
  ['postponed', 'Postponed (rain)', 'border-sky-300 bg-sky-50', 'nature waters'],
];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [species, setSpecies] = useState([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError('');
    try { setData((await client.get('/dashboard')).data); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function water(plant) {
    try {
      await client.post(`/plants/${plant._id}/events`, { type: 'water', amountMl: 250 });
      toast(`${plant.nickname} watered 💧`);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function addPlant(form) {
    setBusy(true);
    try {
      await client.post('/plants', form);
      toast(`${form.nickname} potted up!`);
      setShowAdd(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const total = data ? Object.values(data.counts).reduce((s, n) => s + n, 0) : 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="serif text-3xl font-bold">Today in the garden</h1>
            <p className="text-sm text-stone-500">{total} plants under your care</p>
          </div>
          <button
            onClick={async () => { if (!species.length) setSpecies((await client.get('/species')).data); setShowAdd(true); }}
            className="rounded-full bg-leaf px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
            + Add plant
          </button>
        </div>

        {data?.weather && (
          <div className={`mt-6 flex flex-wrap items-center gap-3 rounded-2xl border p-4 ${data.weather.rainAlert ? 'border-sky-300 bg-sky-50' : 'border-sand bg-white'}`}>
            <span className="text-2xl">{data.weather.rainAlert ? '🌧️' : '⛅'}</span>
            <div className="flex-1">
              <p className="font-medium">
                {data.weather.rainAlert ? data.weather.rainAlert : `No significant rain forecast for ${data.weather.city}`}
              </p>
              <p className="text-xs text-stone-400">
                forecast source: {data.weather.source === 'openweather' ? 'OpenWeather (live)' : 'simulated (set OPENWEATHER_API_KEY for live data)'}
                {' · '}next 5 days: {data.weather.forecast.map((f) => `${new Date(f.date).toLocaleDateString('en-IN', { weekday: 'short' })} ${f.rainMm}mm`).join(' · ')}
              </p>
            </div>
          </div>
        )}

        {error && <div className="mt-6"><ErrorState message={error} onRetry={load} /></div>}
        {!error && data === null && <Loading label="Checking the soil…" />}
        {!error && data !== null && total === 0 && (
          <div className="mt-6">
            <Empty title="No plants yet" hint="Add your first pot — pick a species and GreenGrid sets the schedule."
              action={<button onClick={() => setShowAdd(true)} className="rounded-full bg-leaf px-5 py-2.5 text-sm font-medium text-white">Add a plant</button>} />
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map(([key, title, tone]) => (
            <section key={key} className={`rounded-3xl border-2 p-4 ${tone}`}>
              <h2 className="serif mb-3 flex items-center justify-between text-lg font-bold">
                {title} <span className="rounded-full bg-white/70 px-2 text-sm">{data?.counts[key] ?? 0}</span>
              </h2>
              <div className="space-y-3">
                {data?.groups[key]?.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-sand bg-white p-3">
                    <div className="flex items-center gap-3">
                      <MoistureRing plant={p} size={56} />
                      <div className="min-w-0 flex-1">
                        <Link to={`/plants/${p._id}`} className="serif block truncate font-bold hover:text-leaf">{p.nickname}</Link>
                        <p className="truncate text-xs text-stone-400">{p.species} · {p.location}</p>
                        <p className={`text-xs ${dueLabel(p).cls}`}>{dueLabel(p).text}</p>
                      </div>
                    </div>
                    {p.postponeReason && <p className="mt-2 rounded-lg bg-sky-50 px-2 py-1 text-[11px] text-sky-700">🌧️ {p.postponeReason}</p>}
                    <button onClick={() => water(p)} className="mt-2 w-full rounded-full bg-leaf-soft py-1.5 text-xs font-bold text-leaf hover:bg-leaf hover:text-white">
                      💧 Water now
                    </button>
                  </div>
                ))}
                {data && data.groups[key].length === 0 && <p className="py-4 text-center text-xs text-stone-400">nothing here</p>}
              </div>
            </section>
          ))}
        </div>
      </main>

      {showAdd && (
        <AddPlantModal species={species} busy={busy} onCancel={() => setShowAdd(false)} onSave={addPlant} defaultCity={user?.city} />
      )}
    </div>
  );
}

function AddPlantModal({ species, busy, onCancel, onSave }) {
  const [form, setForm] = useState({ species: 'Money Plant', nickname: '', location: 'indoor', potType: 'plastic', sunLevel: 'medium' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    if (!form.nickname.trim()) return setError('Give your plant a nickname.');
    onSave({ ...form, nickname: form.nickname.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onCancel}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-6">
        <h2 className="serif text-lg font-bold">Pot a new plant</h2>
        {error && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-terra">{error}</p>}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block"><span className="text-sm font-medium">Species</span>
            <select value={form.species} onChange={set('species')} className="mt-1 w-full rounded-2xl border border-sand bg-white px-3 py-2 outline-none focus:border-leaf">
              {species.map((s) => <option key={s.name} value={s.name}>{s.name} (every {s.intervalDays}d)</option>)}
            </select></label>
          <label className="block"><span className="text-sm font-medium">Nickname</span>
            <input value={form.nickname} onChange={set('nickname')} placeholder="e.g. Balcony Rani" className="mt-1 w-full rounded-2xl border border-sand px-3 py-2 outline-none focus:border-leaf" /></label>
          <label className="block"><span className="text-sm font-medium">Location</span>
            <select value={form.location} onChange={set('location')} className="mt-1 w-full rounded-2xl border border-sand bg-white px-3 py-2 outline-none focus:border-leaf">
              <option value="indoor">Indoor</option><option value="outdoor">Outdoor</option>
            </select></label>
          <label className="block"><span className="text-sm font-medium">Pot</span>
            <select value={form.potType} onChange={set('potType')} className="mt-1 w-full rounded-2xl border border-sand bg-white px-3 py-2 outline-none focus:border-leaf">
              <option value="terracotta">Terracotta</option><option value="plastic">Plastic</option><option value="ceramic">Ceramic</option>
            </select></label>
        </div>
        <p className="mt-3 rounded-xl bg-leaf-soft px-3 py-2 text-xs text-leaf">
          {species.find((s) => s.name === form.species)?.note}
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-2xl border border-sand py-2.5 font-medium text-stone-600">Cancel</button>
          <button disabled={busy} className="flex-1 rounded-2xl bg-leaf py-2.5 font-medium text-white disabled:opacity-60">{busy ? 'Potting…' : 'Add plant'}</button>
        </div>
      </form>
    </div>
  );
}
