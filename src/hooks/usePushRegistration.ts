import { useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import ViblyFcm from "@/plugins/ViblyFcm";

const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform(); // "ios" | "android" | "web"
const LAST_FCM_TOKEN_KEY = "vibly_last_fcm_token";

function isApnsToken(token: string): boolean {
  return /^[0-9A-Fa-f]{64}$/.test(token.trim());
}

function extractTokenFromEventDetail(detail: unknown): string | null {
  if (!detail) return null;
  const getToken = (obj: Record<string, unknown>) => {
    const t = obj.token ?? obj.fcm_token;
    return typeof t === "string" ? t : null;
  };
  // Capacitor iOS triggerWindowJSEvent sometimes delivers `detail` as a stringified JSON.
  if (typeof detail === "string") {
    try {
      const parsed = JSON.parse(detail) as Record<string, unknown>;
      return getToken(parsed);
    } catch {
      return null;
    }
  }
  if (typeof detail === "object" && detail !== null) {
    return getToken(detail as Record<string, unknown>);
  }
  return null;
}

function toFriendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/plugin|not set|not installed|unavailable/i.test(msg)) {
    return "Enable Push Notifications in Xcode (Signing & Capabilities) and run on a real device.";
  }
  if (/timeout/i.test(msg)) return "Registration is taking longer than usual. Try again in a moment.";
  return msg || "Push registration failed";
}

/**
 * On iOS: requests push permission via Capacitor, then waits for Firebase to
 * deliver the FCM registration token (not the raw APNs token). The FCM token
 * is what the send-push Edge Function needs.
 *
 * On Android: FCM token comes directly from @capacitor/push-notifications
 * registration event (Firebase is already integrated in the Android runtime).
 *
 * Both tokens are saved to profiles.fcm_token.
 */
export async function registerPushAndSaveToken(userId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isNative) {
    try {
      if ("Notification" in window) await Notification.requestPermission();
    } catch {
      // ignore
    }
    return { ok: true };
  }

  try {
    // Ensure Supabase session is ready before starting native registration.
    // On mobile cold start, push token events can fire before auth is fully restored.
    const {
      data: { user: authedUser },
      error: authedUserErr,
    } = await supabase.auth.getUser();
    if (authedUserErr) {
      return { ok: false, error: authedUserErr.message };
    }
    if (!authedUser?.id) {
      return { ok: false, error: "Login still loading. Try again in 2 seconds." };
    }
    if (authedUser.id !== userId) {
      return { ok: false, error: "Session mismatch. Please wait a moment and try again." };
    }

    const { PushNotifications } = await import("@capacitor/push-notifications");

    const permStatus = await PushNotifications.checkPermissions();
    const status =
      permStatus.receive === "prompt"
        ? (await PushNotifications.requestPermissions()).receive
        : permStatus.receive;

    if (status !== "granted") {
      return { ok: false, error: "Permission denied" };
    }

    // On iOS: get FCM token from native plugin (reliable) or from event/cache. Store in profiles.fcm_token.
    if (platform === "ios") {
      // 1) Check cache, then ask native plugin for token (in case it was stored before JS was ready).
      const cached = (typeof localStorage !== "undefined" && localStorage.getItem(LAST_FCM_TOKEN_KEY))?.trim();
      if (cached && !isApnsToken(cached)) {
        const { data, error } = await supabase
          .from("profiles")
          .update({ fcm_token: cached })
          .eq("id", userId)
          .select("id")
          .maybeSingle();
        if (!error && data?.id) return { ok: true };
      }
      try {
        const { token: nativeToken } = await ViblyFcm.getLastFcmToken();
        const t = (nativeToken ?? "").trim();
        if (t && !isApnsToken(t)) {
          const { data, error } = await supabase
            .from("profiles")
            .update({ fcm_token: t })
            .eq("id", userId)
            .select("id")
            .maybeSingle();
          if (!error && data?.id) return { ok: true };
        }
      } catch {
        // Plugin may not be registered yet; continue to polling
      }

      // 2) Trigger registration and poll native plugin + event + localStorage until we have the token.
      return new Promise((resolve) => {
        let settled = false;
        const finish = (ok: boolean, error?: string) => {
          if (settled) return;
          settled = true;
          clearTimeout(t);
          if (pollId !== undefined) clearInterval(pollId);
          if (pluginPollId !== undefined) clearInterval(pluginPollId);
          window.removeEventListener("CapacitorFCMTokenReceived", onFcmToken as EventListener);
          resolve({ ok, error });
        };
        const saveAndFinish = (token: string) => {
          if (!token || isApnsToken(token)) return;
          try {
            localStorage.setItem(LAST_FCM_TOKEN_KEY, token);
          } catch {}
          void supabase
            .from("profiles")
            .update({ fcm_token: token })
            .eq("id", userId)
            .select("id")
            .maybeSingle()
            .then(({ data, error }) => {
              if (!error && data?.id) finish(true);
            });
        };
        const onFcmToken = async (e: CustomEvent) => {
          const token = extractTokenFromEventDetail((e as CustomEvent).detail)?.trim();
          if (token) saveAndFinish(token);
        };
        window.addEventListener("CapacitorFCMTokenReceived", onFcmToken as EventListener);

        // Poll native plugin every 1.2s — most reliable way to get the token when user just allowed.
        let pluginPollId: ReturnType<typeof setInterval> | undefined;
        pluginPollId = setInterval(() => {
          ViblyFcm.getLastFcmToken()
            .then(({ token }) => {
              if (token?.trim()) saveAndFinish(token.trim());
            })
            .catch(() => {});
        }, 1200);

        // Also poll localStorage (in case event delivered the token).
        let pollId: ReturnType<typeof setInterval> | undefined;
        pollId = setInterval(() => {
          try {
            const c = localStorage.getItem(LAST_FCM_TOKEN_KEY)?.trim();
            if (c && !isApnsToken(c)) {
              void supabase
                .from("profiles")
                .update({ fcm_token: c })
                .eq("id", userId)
                .select("id")
                .maybeSingle()
                .then(({ data }) => {
                  if (data?.id) finish(true);
                });
            }
          } catch {}
        }, 500);

        const t = setTimeout(
          () => finish(false, toFriendlyError(new Error("Registration timeout – try again in a moment."))),
          45000
        );
        setTimeout(() => void PushNotifications.register(), 300);
      });
    }

    // Android: plugin "registration" event delivers the FCM token directly.
    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok: boolean, error?: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(t);
        void PushNotifications.removeAllListeners().catch(() => {});
        resolve({ ok, error });
      };
      const onToken = async (payload: { value: string }) => {
        const token = payload.value?.trim();
        if (!token || /^[0-9A-Fa-f]{64}$/.test(token)) {
          finish(false, "Invalid token received.");
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          finish(false, "Login not ready – please try again in a moment.");
          return;
        }
        const { error } = await supabase.from("profiles").update({ fcm_token: token }).eq("id", userId);
        if (error) console.warn("[PushReg] FCM token save failed:", error.message);
        finish(!error, error?.message);
      };
      const onErr = (err: { error: string }) => finish(false, toFriendlyError(new Error(err.error)));
      void PushNotifications.addListener("registration", onToken);
      void PushNotifications.addListener("registrationError", onErr);
      const t = setTimeout(() => finish(false, toFriendlyError(new Error("Registration timeout"))), 20000);
      setTimeout(() => void PushNotifications.register(), 400);
    });
  } catch (e) {
    return { ok: false, error: toFriendlyError(e) };
  }
}

export type PushPermissionState = "prompt" | "granted" | "denied" | "unknown";

export async function getPushPermissionState(): Promise<PushPermissionState> {
  if (!isNative) return "unknown";
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const { receive } = await PushNotifications.checkPermissions();
    return receive === "granted" ? "granted" : receive === "denied" ? "denied" : "prompt";
  } catch {
    return "unknown";
  }
}

export function usePushRegistration() {
  const { user } = useAuth();

  const registerAndSaveToken = useCallback(async () => {
    if (!user?.id) return { ok: false, error: "Not logged in" };
    return registerPushAndSaveToken(user.id);
  }, [user?.id]);

  return { isNative, registerAndSaveToken };
}
