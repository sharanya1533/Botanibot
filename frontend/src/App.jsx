import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PlantDetail from './pages/PlantDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import Guide from './pages/Guide.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/garden" element={<Dashboard />} />
        <Route path="/plants/:id" element={<PlantDetail />} />
      </Route>
      <Route path="/guide" element={<Guide />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
