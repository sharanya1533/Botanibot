import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', city: 'Bengaluru' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    if (form.name.trim().length < 2) return 'Enter your name (2+ characters).';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      return 'Password needs 8+ characters with a letter and a number.';
    if (!form.city.trim()) return 'Tell us your city so forecasts work.';
    return '';
  }

  async function submit(e) {
    e.preventDefault();
    const v = validate();
    setError(v);
    if (v) return;
    setBusy(true);
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim(), city: form.city.trim() });
      toast('Garden created — add your first plant!');
      navigate('/garden');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="serif text-2xl font-bold">Start your garden</h1>
          <p className="text-sm text-stone-500">Your city powers the rain forecasts</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-sand bg-white p-6">
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-terra">{error}</p>}
          <label className="block"><span className="text-sm font-medium">Name</span>
            <input value={form.name} onChange={set('name')} className="mt-1 w-full rounded-2xl border border-sand px-3 py-2.5 outline-none focus:border-leaf" /></label>
          <label className="block"><span className="text-sm font-medium">City</span>
            <input value={form.city} onChange={set('city')} className="mt-1 w-full rounded-2xl border border-sand px-3 py-2.5 outline-none focus:border-leaf" /></label>
          <label className="block"><span className="text-sm font-medium">Email</span>
            <input type="email" value={form.email} onChange={set('email')} className="mt-1 w-full rounded-2xl border border-sand px-3 py-2.5 outline-none focus:border-leaf" /></label>
          <label className="block"><span className="text-sm font-medium">Password</span>
            <input type="password" value={form.password} onChange={set('password')} className="mt-1 w-full rounded-2xl border border-sand px-3 py-2.5 outline-none focus:border-leaf" /></label>
          <button disabled={busy} className="w-full rounded-2xl bg-leaf py-2.5 font-medium text-white disabled:opacity-60">{busy ? 'Planting…' : 'Create account'}</button>
          <p className="text-center text-sm text-stone-500">Already growing? <Link to="/login" className="font-medium text-leaf hover:underline">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
