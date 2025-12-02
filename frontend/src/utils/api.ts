import axios from 'axios';

// Determine the correct API URL based on environment
const getApiBaseUrl = () => {
  // If VITE_API_BASE_URL is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // If we're on production domain, use production API
  if (window.location.hostname === 'hksfoods.com' ||
    window.location.hostname === 'www.hksfoods.com' ||
    window.location.hostname === 'hksfoods.netlify.app') {
    return 'https://hks-foods.onrender.com/api';
  }

  // Otherwise, use localhost for development
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

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

export default api;
