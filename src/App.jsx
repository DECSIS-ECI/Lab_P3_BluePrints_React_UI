import { useState, useEffect } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import BlueprintsPage from './pages/BlueprintsPage.jsx';
import BlueprintDetailPage from './pages/BlueprintDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#181a1b' : '#f8f9fa';
    document.body.style.transition = 'background 0.3s';
  }, [darkMode]);

  return (
    <div className={`container mt-5 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`} style={{ minHeight: '100vh', transition: 'background 0.3s, color 0.3s' }}>
      <header className="mb-4 text-center">
        <h1 className="display-4 mb-3">ECI - Laboratorio de Blueprints en React</h1>
        <nav className="d-flex justify-content-end gap-3 mb-2">
          <NavLink to="/" end className="btn btn-outline-primary">
            Blueprints
          </NavLink>
          <NavLink to="/login" className="btn btn-outline-secondary">
            Login
          </NavLink>
          <button className={`btn ${darkMode ? 'btn-light' : 'btn-dark'}`} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<BlueprintsPage darkMode={darkMode} />} />
        <Route path="/blueprints/:author/:name" element={<BlueprintDetailPage darkMode={darkMode} />} />
        <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className={`mt-5 text-center small ${darkMode ? 'text-light' : 'text-muted'}`}>
        Autores: Anderson Fabian Garcia Nieto y Juana Lozano Chaves
      </footer>
    </div>
  );
}
