import { createClient } from '@supabase/supabase-js';

const getEnvVar = (name, viteValue) => {
  if (viteValue) return viteValue;
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
  } catch (e) {
    // Ignore
  }
  return null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : null);
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : null);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.info('ℹ️ Health Express: Supabase environment variables (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY) are not set. Operating in local development demo mode.');
}

// Export single Supabase client instance (or null in demo mode)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
