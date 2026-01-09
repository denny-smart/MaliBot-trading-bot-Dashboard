import { createClient } from '@supabase/supabase-js';

const supabaseUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/supabase`
  : (import.meta.env.VITE_SUPABASE_URL as string);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
