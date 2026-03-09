import axios from 'axios';

// Creamos la instancia de Axios
const api = axios.create({
  // Prioriza la URL del .env, si no existe usa la de localhost por defecto
  // Incluye /api/v1 para coincidir con @RequestMapping del backend
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Petición:
 * Antes de que cada solicitud salga, revisamos si hay un token en el localStorage.
 * Si existe, lo añadimos al encabezado Authorization como 'Bearer <token>'.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Respuesta:
 * Si el backend responde con un error 401 (No autorizado),
 * significa que el token expiró o es inválido, así que limpiamos el storage.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesión expirada o no autorizada. Limpiando token...');
      localStorage.removeItem('token');
      // Opcional: Redirigir al login si usas window.location
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;