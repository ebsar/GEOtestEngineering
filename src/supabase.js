import { createClient } from "@supabase/supabase-js";

let clientPromise;

const readConfig = async () => {
  const viteConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  if (viteConfig.supabaseUrl && viteConfig.supabaseAnonKey) {
    return viteConfig;
  }

  const response = await fetch("/api/supabase-config");

  if (response.ok) {
    return response.json();
  }

  const details = await response.json().catch(() => ({}));
  throw new Error(details.error || "Could not load Supabase configuration.");
};

export const getSupabaseClient = async () => {
  if (!clientPromise) {
    clientPromise = readConfig().then(({ supabaseUrl, supabaseAnonKey }) =>
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }),
    );
  }

  return clientPromise;
};
