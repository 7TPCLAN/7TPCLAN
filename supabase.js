/* =========================
   7TPclan SUPABASE CONFIG
========================= */

/*
  Replace these placeholders with the values from:
  Supabase Dashboard -> Connect / API Keys.

  Use the project's publishable/anon browser key.
  NEVER put the service_role/secret key in this file.
*/

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

window.supabaseClient = supabaseClient;
