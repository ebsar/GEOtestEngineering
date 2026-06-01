export default function handler(request, response) {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.supabase_url ||
    process.env.SUPABASE_AURL ||
    process.env.supabase_aurl ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.supabase_anon_key ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  if (!supabaseUrl || !supabaseAnonKey) {
    response.status(500).json({
      error: "Missing Supabase environment variables.",
      required: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
    });
    return;
  }

  response.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
  });
}
