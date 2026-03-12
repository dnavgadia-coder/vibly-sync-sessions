/**
 * Sends push notifications via Firebase Cloud Messaging HTTP v1 API (recommended).
 *
 * Uses a Service Account — no legacy Server Key. Set these Supabase Edge Function secrets:
 *   FCM_PROJECT_ID     — Firebase project ID (e.g. vibly-d4217)
 *   FCM_CLIENT_EMAIL  — Service account "client_email" from JSON
 *   FCM_PRIVATE_KEY   — Service account "private_key" from JSON (paste with \n for newlines)
 *
 * How to get them: Firebase Console → Project Settings → Service Accounts →
 *   Generate new private key → use project_id, client_email, private_key from the JSON.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://esm.sh/jose@5.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookRecord {
  user_id: string;
  title: string;
  body?: string | null;
  type?: string;
  data?: Record<string, unknown>;
}

interface WebhookPayload {
  type?: string;
  table?: string;
  record?: WebhookRecord;
  user_id?: string;
  title?: string;
  body?: string;
  notif_type?: string;
  data?: Record<string, unknown>;
}

/** Get a short-lived OAuth2 access token for FCM using the service account. */
async function getFcmAccessToken(): Promise<string> {
  const projectId = Deno.env.get("FCM_PROJECT_ID");
  const clientEmail = Deno.env.get("FCM_CLIENT_EMAIL");
  const privateKeyPem = Deno.env.get("FCM_PRIVATE_KEY");
  if (!projectId || !clientEmail || !privateKeyPem) {
    throw new Error("Missing FCM_PROJECT_ID, FCM_CLIENT_EMAIL, or FCM_PRIVATE_KEY");
  }
  const privateKey = privateKeyPem.replace(/\\n/g, "\n");
  const key = await jose.importPKCS8(privateKey, "RS256");
  const jwt = await new jose.SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(clientEmail)
    .setAudience("https://oauth2.googleapis.com/token")
    .setSubject(clientEmail)
    .setIssuedAt(Math.floor(Date.now() / 1000))
    .setExpirationTime("1h")
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth2 token error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

/** Send one FCM message via HTTP v1 API. */
async function sendFcmV1(
  accessToken: string,
  projectId: string,
  fcmToken: string,
  title: string,
  body: string,
  notifType?: string,
  extraData?: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const data: Record<string, string> = {
    type: notifType ?? "general",
    title,
    body,
    ...Object.fromEntries(
      Object.entries(extraData ?? {}).map(([k, v]) => [k, String(v)])
    ),
  };

  const message: Record<string, unknown> = {
    token: fcmToken,
    notification: { title, body },
    data,
    android: {
      priority: "high",
      notification: { title, body },
    },
    apns: {
      payload: {
        aps: {
          alert: { title, body },
          sound: "default",
          badge: 1,
        },
      },
      fcm_options: {},
    },
  };

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `FCM v1 error ${res.status}: ${text}` };
  }
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be application/json" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = (await req.json()) as WebhookPayload;

    let userId: string;
    let title: string;
    let body: string;
    let notifType: string | undefined;
    let extraData: Record<string, unknown> | undefined;

    if (payload.type === "INSERT" && payload.table === "notifications" && payload.record) {
      const r = payload.record;
      userId = r.user_id;
      title = r.title;
      body = r.body ?? "";
      notifType = r.type;
      extraData = r.data;
    } else if (payload.user_id && payload.title) {
      userId = payload.user_id;
      title = payload.title;
      body = payload.body ?? "";
      notifType = payload.notif_type;
      extraData = payload.data;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid payload — provide user_id + title, or use DB webhook format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .eq("id", userId)
      .single();

    const token = profile?.fcm_token;
    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ sent: false, reason: "No push token saved for this user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // FCM tokens are long (150+ chars). A 64-char hex string is an APNs device token — we need the FCM token.
    const looksLikeApns = /^[0-9A-Fa-f]{64}$/.test(token.trim());
    if (looksLikeApns) {
      return new Response(
        JSON.stringify({
          sent: false,
          reason: "Stored value is an APNs device token, not an FCM token. On iOS, re-allow notifications so the app saves the FCM token from Firebase.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const projectId = Deno.env.get("FCM_PROJECT_ID");
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: "FCM_PROJECT_ID secret not set. Use Service Account (see docs)." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getFcmAccessToken();
    const result = await sendFcmV1(
      accessToken,
      projectId,
      token,
      title,
      body || " ",
      notifType,
      extraData
    );

    return new Response(
      JSON.stringify({ sent: result.ok, error: result.error }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[send-push] error:", e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
