import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// REST configuration derived from env (works for both remote and local)
export const REST_URL = `${supabaseUrl.replace(/\/$/, '')}/rest/v1`;
export const AUTH_URL = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
export const restHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || supabaseAnonKey;

  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Database table names
export const TABLES = {
  USERS: 'users',
  CLASSES: 'yoga_classes',
  REGISTRATIONS: 'class_registrations',
  PROFILES: 'profiles',
} as const;
