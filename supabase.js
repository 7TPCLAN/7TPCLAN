const SUPABASE_URL = "https://cbzlfphgflflxqripiur.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_jP8iWPGjzWbrpxBKyxJSLg_CYMoWuf1";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

window.supabaseClient = supabaseClient;
