// ============================================================
// NO RISK NO FUN 2026 — football-data.org PROXY (Supabase Edge Function)
// ------------------------------------------------------------
// football-data.org staat browser-CORS alleen toe vanaf http://localhost,
// dus vanaf GitHub Pages kan de client niet rechtstreeks bellen. Deze functie
// proxyt server-side (geen CORS-probleem) en houdt de API-key serverside.
//
// De key wordt gelezen uit de `settings`-tabel (key='fd_api_key'), die de
// admin via de UI opslaat. Optioneel kun je 'm ook als secret zetten:
//   supabase secrets set FD_API_KEY=...
//
// Deploy (CLI):      supabase functions deploy fd-proxy
//   of via Dashboard → Edge Functions → Create function → naam 'fd-proxy' → plak deze code → Deploy.
// JWT-verificatie mag aan blijven (alleen ingelogde gebruikers kunnen bellen).
// ============================================================

const FD_BASE = "https://api.football-data.org/v4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function getKey(): Promise<string> {
  const envKey = Deno.env.get("FD_API_KEY");
  if (envKey) return envKey;
  const url = Deno.env.get("SUPABASE_URL");
  const srv = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !srv) return "";
  const r = await fetch(`${url}/rest/v1/settings?key=eq.fd_api_key&select=value`, {
    headers: { apikey: srv, Authorization: `Bearer ${srv}` },
  });
  if (!r.ok) return "";
  const rows = await r.json();
  return rows?.[0]?.value || "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    let path = "";
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      path = (body as { path?: string }).path || "";
    } else {
      path = new URL(req.url).searchParams.get("path") || "";
    }
    // Alleen WK-endpoints toestaan.
    if (!path.startsWith("/competitions/WC")) {
      return json({ error: "path moet beginnen met /competitions/WC" }, 400);
    }
    const key = await getKey();
    if (!key) return json({ error: "Geen fd_api_key gevonden (settings/secret)" }, 400);

    const res = await fetch(FD_BASE + path, { headers: { "X-Auth-Token": key } });
    const text = await res.text();
    // Geef football-data status + body door (incl. 429 rate-limit).
    return new Response(text, { status: res.status, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
