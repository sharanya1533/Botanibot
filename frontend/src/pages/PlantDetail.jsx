import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, ErrorState } from '../components/states.jsx';
import { MoistureRing, dueLabel } from '../components/ui.jsx';
import { useToast } from '../context/ToastContext.jsx';

const EVENT_ICONS = { water: '💧', fertilize: '🌱', prune: '✂️', repot: '🪴' };

export default function PlantDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [plant, setPlant] = useState(null);
  const [error, setError] = useState('');
  const [journalForm, setJournalForm] = useState({ month: new Date().toISOString().slice(0, 7), heightCm: '', note: '' });

  async function load() {
    setError('');
    try { setPlant((await client.get(`/plants/${id}`)).data); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, [id]);

  async function act(fn, msg) {
    try { await fn(); toast(msg); load(); } catch (err) { toast(err.message, 'error'); }
  }

  if (error) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} onRetry={load} /></main></div>;
  if (!plant) return <div className="min-h-screen"><Navbar /><Loading label="Watering the details…" /></div>;

  const heights = plant.journal.filter((j) => j.heightCm);
  const maxH = Math.max(...heights.map((j) => j.heightCm), 1);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/garden" className="text-sm text-stone-400 hover:text-leaf">← Back to the garden</Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6">
          <div className="flex items-center gap-4">
            <MoistureRing plant={plant} size={84} />
            <div>
              <h1 className="serif text-3xl font-bold">{plant.nickname}</h1>
              <p className="text-sm capitalize text-stone-500">{plant.species} · {plant.potType} pot · {plant.sunLevel} light · {plant.location}</p>
              <p className={`text-sm ${dueLabel(plant).cls}`}>water {dueLabel(plant).text}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => act(() => client.post(`/plants/${id}/events`, { type: 'water', amountMl: 250 }), 'Watered 💧')}
              className="rounded-full bg-leaf px-5 py-2.5 text-sm font-medium text-white">💧 Water</button>
            <button onClick={() => act(() => client.post(`/plants/${id}/events`, { type: 'fertilize' }), 'Fertilized 🌱')}
              className="rounded-full border border-sand px-5 py-2.5 text-sm font-medium">🌱 Fertilize</button>
            <button onClick={() => act(() => client.post(`/plants/${id}/events`, { type: 'prune' }), 'Pruned ✂️')}
              className="rounded-full border border-sand px-5 py-2.5 text-sm font-medium">✂️ Prune</button>
            <button onClick={() => act(() => client.post(`/plants/${id}/events`, { type: 'repot' }), 'Repotted 🪴')}
              className="rounded-full border border-sand px-5 py-2.5 text-sm font-medium">🪴 Repot</button>
          </div>
        </div>

        {plant.postponeReason && (
          <p className="mt-4 rounded-2xl border border-sky-300 bg-sky-50 p-4 text-sm text-sky-800">🌧️ {plant.postponeReason}</p>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-sand bg-white p-5">
            <h2 className="serif text-lg font-bold">Care timeline</h2>
            <ol className="mt-3 space-y-3">
              {[...plant.events].reverse().map((e, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-lg">{EVENT_ICONS[e.type]}</span>
                  <div>
                    <p className="font-medium capitalize">{e.type}{e.amountMl ? ` · ${e.amountMl}ml` : ''}</p>
                    {e.note && <p className="text-stone-500">{e.note}</p>}
                    <p className="text-xs text-stone-400">{new Date(e.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-sand bg-white p-5">
              <h2 className="serif text-lg font-bold">Growth journal</h2>
              {heights.length > 0 && (
                <div className="mt-3 flex h-24 items-end gap-2">
                  {heights.map((j) => (
                    <div key={j.month} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] text-stone-500">{j.heightCm}cm</span>
                      <div className="w-full rounded-t-lg bg-leaf" style={{ height: `${(j.heightCm / maxH) * 100}%` }} />
                      <span className="text-[10px] text-stone-400">{j.month.slice(5)}</span>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={(e) => {
                e.preventDefault();
                act(() => client.post(`/plants/${id}/journal`, {
                  month: journalForm.month,
                  ...(journalForm.heightCm ? { heightCm: Number(journalForm.heightCm) } : {}),
                  ...(journalForm.note ? { note: journalForm.note } : {}),
                }), 'Journal updated');
                setJournalForm({ ...journalForm, heightCm: '', note: '' });
              }} className="mt-3 flex gap-2">
                <input type="month" value={journalForm.month} onChange={(e) => setJournalForm({ ...journalForm, month: e.target.value })}
                  className="w-28 rounded-xl border border-sand px-2 py-1.5 text-sm outline-none focus:border-leaf" />
                <input type="number" placeholder="cm" value={journalForm.heightCm} onChange={(e) => setJournalForm({ ...journalForm, heightCm: e.target.value })}
                  className="w-16 rounded-xl border border-sand px-2 py-1.5 text-sm outline-none focus:border-leaf" />
                <input placeholder="note" value={journalForm.note} onChange={(e) => setJournalForm({ ...journalForm, note: e.target.value })}
                  className="flex-1 rounded-xl border border-sand px-2 py-1.5 text-sm outline-none focus:border-leaf" />
                <button className="rounded-xl bg-leaf px-3 py-1.5 text-sm font-medium text-white">Save</button>
              </form>
            </div>

            <div className="rounded-3xl border border-sand bg-white p-5">
              <h2 className="serif text-lg font-bold">5-day forecast — {plant.forecast?.[0]?.source === 'openweather' ? 'live' : 'simulated'}</h2>
              <div className="mt-3 flex gap-2">
                {plant.forecast?.map((f) => (
                  <div key={f.date} className={`flex-1 rounded-2xl p-2 text-center text-xs ${f.rainMm >= 5 ? 'bg-sky-100 text-sky-800' : 'bg-cream'}`}>
                    <p className="font-bold">{new Date(f.date).toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                    <p>{f.rainMm}mm</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
