import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api', // Mettez votre URL d'API ici
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token Supabase aux requêtes
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  } catch (error) {
    console.error('Error getting Supabase session:', error);
    return config;
  }
}, (error) => {
  return Promise.reject(error);
});

export default api;