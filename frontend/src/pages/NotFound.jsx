import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="serif text-7xl font-bold text-leaf">404</p>
      <h1 className="serif text-xl font-bold">This leaf fell off</h1>
      <p className="text-stone-500">The page you're looking for doesn't exist.</p>
      <Link to="/garden" className="rounded-full bg-leaf px-6 py-2.5 font-medium text-white">Back to the garden</Link>
    </div>
  );
}
