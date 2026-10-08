import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Normalizar la URL por si contiene /rest/v1/ al final
const cleanUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

export const isSupabaseConfigured = Boolean(
  cleanUrl &&
  supabaseAnonKey &&
  !cleanUrl.includes('tu-proyecto') &&
  !supabaseAnonKey.includes('tu-anon-public-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(cleanUrl, supabaseAnonKey.trim())
  : null;
