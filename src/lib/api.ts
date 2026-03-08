// Backend API configuration
// Render backend for new API endpoints (911 dispatch, custom logic, etc.)
export const RENDER_API_URL = 'https://texas-watch.onrender.com';

// Lovable Cloud (Supabase) for existing edge functions
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
