import { createClient } from '@supabase/supabase-js';

const supabaseUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/supabase`
  : (import.meta.env.VITE_SUPABASE_URL as string);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_ANON_KEY');
}

// Use a fallback key to prevent crash, though requests will fail if key is invalid
export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'fallback-key');
