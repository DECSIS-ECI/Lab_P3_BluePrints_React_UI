import { NavLink, Route, Routes } from 'react-router-dom'
import BlueprintsPage from './pages/BlueprintsPage.jsx'
import BlueprintDetailPage from './pages/BlueprintDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="container mt-5">
      <header className="mb-4 text-center">
        <h1 className="display-4 mb-3">ECI - Laboratorio de Blueprints en React</h1>
        <nav className="d-flex justify-content-end gap-3">
          <NavLink to="/" end className="btn btn-outline-primary">
            Blueprints
          </NavLink>
          <NavLink to="/login" className="btn btn-outline-secondary">
            Login
          </NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<BlueprintsPage />} />
        <Route path="/blueprints/:author/:name" element={<BlueprintDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    <footer className="mt-5 text-center text-muted small">
      Autores: Anderson Fabian Garcia Nieto y Juana Lozano Chaves
    </footer>
    </div>
  );
}
