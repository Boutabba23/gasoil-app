// client/src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // This will be '/api' in production
  // withCredentials: true, // Often needed for cookies/sessions with CORS, JWT Bearer tokens usually don't require this unless specific SameSite issues
  headers: {
    'Content-Type': 'application/json',
  },
});
// ... (interceptors as before) ...
export default api;