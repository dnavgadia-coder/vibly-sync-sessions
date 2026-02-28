/**
 * Sends a push notification to a user's device via FCM.
 * Invoke from Database Webhook on public.notifications INSERT, or POST with body:
 * { "user_id": "uuid", "title": "...", "body": "..." }
 *
 * Required secrets: FCM_PROJECT_ID, FCM_CLIENT_EMAIL, FCM_PRIVATE_KEY (from Firebase service account)
 * Or FCM_SERVER_KEY (legacy) for simple REST send.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  type?: string;
  table?: string;
  record?: { user_id: string; title: string; body?: string | null };
}

async function sendFcmLegacy(token: string, title: string, body: string): Promise<boolean> {
  const key = Deno.env.get("FCM_SERVER_KEY");
  if (!key) return false;
  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${key}`,
    },
    body: JSON.stringify({
      to: token,
      notification: { title, body },
      priority: "high",
    }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let userId: string;
    let title: string;
    let body: string;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = (await req.json()) as WebhookPayload;
      if (payload.record && payload.type === "INSERT" && payload.table === "notifications") {
        const r = payload.record;
        userId = r.user_id;
        title = r.title;
        body = (r.body as string) || "";
      } else if (payload.user_id && payload.title) {
        userId = payload.user_id;
        title = payload.title;
        body = (payload as { body?: string }).body || "";
      } else {
        return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } else {
      return new Response(JSON.stringify({ error: "Content-Type must be application/json" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabaseAdmin.from("profiles").select("fcm_token").eq("id", userId).single();
    const token = profile?.fcm_token;
    if (!token || typeof token !== "string") {
      return new Response(JSON.stringify({ sent: false, reason: "No push token" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sent = await sendFcmLegacy(token, title, body || " ");
    return new Response(JSON.stringify({ sent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
