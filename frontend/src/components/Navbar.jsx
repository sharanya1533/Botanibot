import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/garden" className="serif flex items-center gap-2 text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf text-sm text-white">☘</span>
          GreenGrid
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {user?.city && <span className="hidden rounded-full bg-leaf-soft px-3 py-1 font-medium text-leaf sm:block">📍 {user.city}</span>}
          {user ? (
            <button onClick={() => { logout(); navigate('/'); }} className="rounded-full border border-sand px-4 py-1.5 font-medium text-stone-600 hover:border-leaf hover:text-leaf">
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="font-medium text-stone-600 hover:text-leaf">Log in</Link>
              <Link to="/register" className="rounded-full bg-leaf px-4 py-2 font-medium text-white hover:opacity-90">Start your garden</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
