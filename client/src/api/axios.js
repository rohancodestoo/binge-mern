import axios from 'axios';

/**
 * Axios instance pointing to our Express backend.
 * All TMDB calls flow through /api/movies on the server,
 * so the TMDB_API_KEY is never exposed to the browser.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('bingeUser') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
