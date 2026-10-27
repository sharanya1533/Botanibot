import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fillDemo = () => setForm({ email: 'veda@demo.com', password: 'Demo@1234' });

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      await login(form.email, form.password);
      toast('Welcome back to the garden');
      navigate('/garden');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-leaf text-xl text-white">☘</span>
          <h1 className="serif mt-3 text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-stone-500">Your plants kept growing</p>
          <button type="button" onClick={fillDemo} className="mt-4 rounded-full border border-leaf/30 bg-leaf/5 px-4 py-2 text-sm font-semibold text-leaf transition hover:bg-leaf/10">Explore the demo garden</button>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-sand bg-white p-6">
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-terra">{error}</p>}
          <label className="block"><span className="text-sm font-medium">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email"
              className="mt-1 w-full rounded-2xl border border-sand px-3 py-2.5 outline-none focus:border-leaf" /></label>
          <label className="block"><span className="text-sm font-medium">Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password"
              className="mt-1 w-full rounded-2xl border border-sand px-3 py-2.5 outline-none focus:border-leaf" /></label>
          <button disabled={busy} className="w-full rounded-2xl bg-leaf py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60">{busy ? 'Growing…' : 'Log in'}</button>
          <p className="text-center text-sm text-stone-500">New here? <Link to="/register" className="font-medium text-leaf hover:underline">Start your garden</Link></p>
        </form>
        <p className="mt-4 text-center text-xs text-stone-400">Demo account · Bengaluru · 6 plants · growth journal</p>
      </div>
    </div>
  );
}
