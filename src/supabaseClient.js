import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't throw — let the app render a helpful message instead of a blank white screen.
  console.error(
    '[supabaseClient] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY. ' +
    'Create a .env file (see .env.example) with your Supabase project credentials.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Public bucket used for project screenshots / profile photos uploaded via the admin panel.
export const STORAGE_BUCKET = 'portfolio';
