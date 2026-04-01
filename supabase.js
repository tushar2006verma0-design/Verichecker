import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the client if we have real configured variables (not placeholders) to avoid crashing
export const supabase = supabaseUrl?.startsWith('http') && supabaseKey && !supabaseKey.includes('your_')
  ? createClient(supabaseUrl, supabaseKey)
  : null;
