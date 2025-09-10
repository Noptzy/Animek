const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
// Support multiple possible env var names from .env
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABSE_SERVICE_ROLE;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY;

if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE_KEY)) {
  console.warn('[supabase] Missing SUPABASE_URL or keys (ANON/SERVICE_ROLE) in environment variables.');
}

// Prefer service role key for server-side writes
const KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL || '', KEY);

module.exports = { supabase };
