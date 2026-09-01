import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://iddtmovlfpumwwfrqifb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_-euuV0rajBkpj3iDsSpb1A_y8kO-Mpb';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

