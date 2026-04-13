import { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_SUPABASE_API_KEY;

const supabaseKey = import.meta.env.VITE_SUPABASE_URL;

export const supabase = createClient(supabaseURL, supabaseKey);