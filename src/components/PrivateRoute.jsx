import { Navigate } from 'react-router-dom'

// Verifica si el usuario está autenticado (ejemplo: token en localStorage)
function isAuthenticated() {
  return !!localStorage.getItem('token')
}

export default function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    // Redirige a login si no está autenticado
    return <Navigate to="/login" replace />
  }
  // Si está autenticado, muestra el contenido protegido
  return children
}
