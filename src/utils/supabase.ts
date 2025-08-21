import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Ensure we use 127.0.0.1 instead of localhost for local development
const normalizedUrl = supabaseUrl.replace('localhost', '127.0.0.1');

export const supabase = createClient(normalizedUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  USERS: 'users',
  CLASSES: 'yoga_classes',
  REGISTRATIONS: 'class_registrations',
  PROFILES: 'profiles',
} as const;
