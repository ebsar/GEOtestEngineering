const readSupabaseConfig = () => ({
  url:
    process.env.SUPABASE_URL ||
    process.env.supabase_url ||
    process.env.SUPABASE_AURL ||
    process.env.supabase_aurl ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL,
  anonKey:
    process.env.SUPABASE_ANON_KEY ||
    process.env.supabase_anon_key ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY,
});

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  const { url, anonKey } = readSupabaseConfig();
  const authorization = request.headers.authorization || "";

  if (!deployHookUrl || !url || !anonKey) {
    response.status(503).json({
      error: "Publishing is not configured. Add VERCEL_DEPLOY_HOOK_URL to the deployment environment.",
    });
    return;
  }

  if (!authorization.startsWith("Bearer ")) {
    response.status(401).json({ error: "Admin authentication is required." });
    return;
  }

  const authHeaders = { apikey: anonKey, Authorization: authorization };
  const userResponse = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, {
    headers: authHeaders,
    cache: "no-store",
  });
  if (!userResponse.ok) {
    response.status(401).json({ error: "The admin session is invalid or expired." });
    return;
  }

  const user = await userResponse.json();
  const adminQuery = new URL(`${url.replace(/\/$/, "")}/rest/v1/admin_users`);
  adminQuery.searchParams.set("select", "user_id");
  adminQuery.searchParams.set("user_id", `eq.${user.id}`);
  adminQuery.searchParams.set("limit", "1");
  const adminResponse = await fetch(adminQuery, {
    headers: authHeaders,
    cache: "no-store",
  });
  const admins = adminResponse.ok ? await adminResponse.json() : [];
  if (!Array.isArray(admins) || admins.length !== 1) {
    response.status(403).json({ error: "This account is not allowed to publish the website." });
    return;
  }

  const deployResponse = await fetch(deployHookUrl, { method: "POST" });
  if (!deployResponse.ok) {
    response.status(502).json({ error: "Vercel did not accept the publish request." });
    return;
  }

  response.setHeader("Cache-Control", "no-store");
  response.status(202).json({ message: "Website publishing started." });
}
