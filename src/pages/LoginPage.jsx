import { useState } from 'react'
import api from '../services/apiClient.js'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      // 1. Enviamos la petición
      const response = await api.post('http://localhost:8080/auth/login', { username, password })
      
      // 2. Verificamos el código de estado HTTP
      if (response.status === 200) {
        // Accedemos a la estructura: response.data (ApiResponse) -> data (TokenResponse)
        const apiResponse = response.data;
        const token = apiResponse.data.access_token; // El nombre exacto en tu Java es access_token
        
        localStorage.setItem('token', token);
        alert('Login exitoso');
        // Opcional: window.location.href = '/blueprints' 
      }
      
    } catch (e) {
      // Si el error es 401, vendrá por aquí
      if (e.response && e.response.status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError('No se pudo conectar con el servidor');
      }
      console.error(e);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <div className="grid cols-2">
        <div>
          <label>Usuario</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <button className="btn primary" style={{ marginTop: 12 }}>
        Ingresar
      </button>
    </form>
  )
}