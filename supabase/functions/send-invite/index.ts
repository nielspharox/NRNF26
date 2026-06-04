// ============================================================
// NO RISK NO FUN 2026 — UITNODIGINGSMAIL (Supabase Edge Function, via Resend)
// ------------------------------------------------------------
// Stuurt een toffe uitnodigingsmail naar iemand die nog geen speler is.
// Body: { toEmail, groupName, inviteUrl, inviterName }
// Key uit settings (key='resend_api_key') of secret RESEND_API_KEY.
// Geen key → { error: 'no_key' } zodat de client terugvalt op de deel-link.
//
// Afzender: settings 'invite_from_email' of secret INVITE_FROM_EMAIL,
//   default 'NO RISK NO FUN <onboarding@resend.dev>' (Resend-testafzender —
//   voor échte verzending naar iedereen: verifieer een eigen domein bij Resend).
//
// Deploy MET JWT-verificatie UIT (zoals fd-proxy): functions deploy <slug> --no-verify-jwt.
// ============================================================

const DB = Deno.env.get("SUPABASE_URL");
const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function setting(key: string): Promise<string> {
  if (!DB || !SRV) return "";
  const r = await fetch(`${DB}/rest/v1/settings?key=eq.${key}&select=value`, {
    headers: { apikey: SRV, Authorization: `Bearer ${SRV}` },
  });
  if (!r.ok) return "";
  const rows = await r.json();
  return rows?.[0]?.value || "";
}

function esc(s: string) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

// Drietalige teksten — taal = die van de uitnodiger (meegestuurd door de client). Default NL.
const STRINGS: Record<string, {
  subject: string; subtitle: string; someone: string;
  group: (g: string) => string; noGroup: string;
  heading: (who: string) => string; body: (grp: string) => string; cta: string;
}> = {
  nl: {
    subject: "Je bent uitgenodigd — NO RISK NO FUN · WK Pool 2026 ⚽",
    subtitle: "WK POOL 2026",
    someone: "iemand",
    group: (g) => `het complot <b>${g}</b>`,
    noGroup: "een complot",
    heading: (who) => `${who} daagt je uit! ⚽`,
    body: (grp) => `Je bent uitgenodigd voor ${grp} in de WK-pool waar lef beloond wordt. Hoe groter de underdog, hoe dikker de punten. Iedereen tipt de favoriet — jij niet.`,
    cta: "DOE MEE ▶",
  },
  en: {
    subject: "You're invited — NO RISK NO FUN · World Cup Pool 2026 ⚽",
    subtitle: "WORLD CUP POOL 2026",
    someone: "Someone",
    group: (g) => `the conspiracy <b>${g}</b>`,
    noGroup: "a conspiracy",
    heading: (who) => `${who} challenges you! ⚽`,
    body: (grp) => `You've been invited to ${grp} in the World Cup pool where guts pay off. The bigger the underdog, the fatter the points. Everyone picks the favourite — you don't.`,
    cta: "JOIN IN ▶",
  },
  de: {
    subject: "Du bist eingeladen — NO RISK NO FUN · WM-Pool 2026 ⚽",
    subtitle: "WM-POOL 2026",
    someone: "Jemand",
    group: (g) => `der Verschwörung <b>${g}</b>`,
    noGroup: "einer Verschwörung",
    heading: (who) => `${who} fordert dich heraus! ⚽`,
    body: (grp) => `Du bist eingeladen zu ${grp} im WM-Pool, wo Mut belohnt wird. Je größer der Außenseiter, desto fetter die Punkte. Alle tippen den Favoriten — du nicht.`,
    cta: "MITMACHEN ▶",
  },
};
function pickLang(lang: string) {
  const l = (lang || "nl").slice(0, 2).toLowerCase();
  return STRINGS[l] || STRINGS.nl;
}

function emailHtml(groupName: string, inviteUrl: string, inviterName: string, lang: string) {
  const s = pickLang(lang);
  const who = inviterName ? esc(inviterName) : s.someone;
  const grp = groupName ? s.group(esc(groupName)) : s.noGroup;
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#1a0033;padding:24px;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#2a0050;border:2px solid #5500aa">
      <tr><td style="height:5px;background:#7b00ff"></td></tr>
      <tr><td style="padding:28px 28px 8px;text-align:center">
        <div style="color:#ffe600;font-size:13px;letter-spacing:2px;font-weight:bold">★ NO RISK NO FUN ★</div>
        <div style="color:#aa44ff;font-size:13px;margin-top:4px">${s.subtitle}</div>
      </td></tr>
      <tr><td style="padding:8px 28px;text-align:center">
        <h1 style="color:#f0e6ff;font-size:24px;margin:14px 0">${s.heading(who)}</h1>
        <p style="color:#d4bef5;font-size:17px;line-height:1.5;margin:0 0 8px">${s.body(grp)}</p>
      </td></tr>
      <tr><td style="padding:18px 28px;text-align:center">
        <a href="${esc(inviteUrl)}" style="display:inline-block;background:#00ff66;color:#0f001f;font-weight:bold;font-size:16px;text-decoration:none;padding:14px 28px;border:2px solid #00cc44">${s.cta}</a>
        <p style="color:#7a5fae;font-size:13px;margin-top:16px;word-break:break-all">${esc(inviteUrl)}</p>
      </td></tr>
      <tr><td style="height:5px;background:#00ff66"></td></tr>
    </table>
  </td></tr></table>
  </body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const body = await req.json().catch(() => ({}));
    const toEmail = (body.toEmail || "").trim();
    if (!toEmail || !toEmail.includes("@")) return json({ error: "bad_email" }, 400);

    const key = (Deno.env.get("RESEND_API_KEY") || await setting("resend_api_key")).trim();
    if (!key) return json({ error: "no_key" }); // client valt terug op deel-link

    const lang = (body.lang || "nl");
    const from = (Deno.env.get("INVITE_FROM_EMAIL") || await setting("invite_from_email") || "NO RISK NO FUN <onboarding@resend.dev>").trim();
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [toEmail],
        subject: pickLang(lang).subject,
        html: emailHtml(body.groupName || "", body.inviteUrl || "", body.inviterName || "", lang),
      }),
    });
    if (!res.ok) return json({ error: "resend_" + res.status, detail: await res.text() }, 502);
    return json({ ok: true });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
