import axios from 'axios';

// Configurar la baseURL dependiendo del entorno
// En producción (Docker), las peticiones van al mismo host (nginx proxy)
// En desarrollo local, van directamente al backend
const baseURL = import.meta.env.VITE_API_URL || '';

if (baseURL) {
  axios.defaults.baseURL = baseURL;
}
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para incluir el token en todas las peticiones
axios.interceptors.request.use(
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

// Interceptor para manejar errores de respuesta
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir a login si:
    // 1. Es un error 401
    // 2. NO es un intento de login/register (para mostrar el mensaje de error)
    const isAuthRoute = error.config?.url?.includes('/auth/login') ||
                        error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
