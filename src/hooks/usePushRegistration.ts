import { useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform(); // "ios" | "android" | "web"
const LAST_FCM_TOKEN_KEY = "vibly_last_fcm_token";

function extractTokenFromEventDetail(detail: unknown): string | null {
  if (!detail) return null;
  // Capacitor iOS triggerWindowJSEvent sometimes delivers `detail` as a stringified JSON.
  if (typeof detail === "string") {
    try {
      const parsed = JSON.parse(detail) as { token?: unknown };
      return typeof parsed.token === "string" ? parsed.token : null;
    } catch {
      return null;
    }
  }
  if (typeof detail === "object") {
    const maybeToken = (detail as { token?: unknown }).token;
    return typeof maybeToken === "string" ? maybeToken : null;
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

    if (platform === "ios") {
      // On iOS, register with APNs first. Firebase Messaging will intercept the
      // APNs token, exchange it with Firebase servers, and deliver the FCM token
      // via the native MessagingDelegate → CapacitorFCMTokenReceived notification.
      return new Promise((resolve) => {
        let settled = false;
        const finish = (ok: boolean, error?: string) => {
          if (settled) return;
          settled = true;
          clearTimeout(t);
          clearInterval(pollId);
          window.removeEventListener("CapacitorFCMTokenReceived", onFcmToken as EventListener);
          resolve({ ok, error });
        };

        // If we already cached a token (native may have fired before this listener), use it immediately.
        try {
          const cached = localStorage.getItem(LAST_FCM_TOKEN_KEY)?.trim();
          if (cached && !/^[0-9A-Fa-f]{64}$/.test(cached)) {
            console.log("[Vibly] (usePushRegistration) using cached FCM token");
            supabase
              .from("profiles")
              .update({ fcm_token: cached })
              .eq("id", userId)
              .select("id,fcm_token")
              .maybeSingle()
              .then(({ data, error }) => {
                console.log("[Vibly] (usePushRegistration) cached update result:", { id: data?.id, tokenLen: data?.fcm_token?.length, error: error?.message });
                finish(!error, error?.message);
              });
            // keep going; if something fails we’ll still listen/poll
          }
        } catch {
          // ignore
        }

        // Listen for the FCM token posted from AppDelegate's MessagingDelegate.
        // Do not save 64-char hex (APNs token); only save real FCM tokens.
        const onFcmToken = async (e: CustomEvent<{ token: string }>) => {
          const token = extractTokenFromEventDetail((e as CustomEvent).detail)?.trim();
          if (!token) return;
          if (/^[0-9A-Fa-f]{64}$/.test(token)) {
            finish(false, "Got device token instead of FCM token. Ensure Firebase SDK is added in Xcode and run on a real device.");
            return;
          }
          try { localStorage.setItem(LAST_FCM_TOKEN_KEY, token); } catch {}
          console.log("[Vibly] (usePushRegistration) saving FCM token for user:", userId, "len=", token.length);
          const { data, error } = await supabase
            .from("profiles")
            .update({ fcm_token: token })
            .eq("id", userId)
            .select("id,fcm_token")
            .maybeSingle();
          console.log("[Vibly] (usePushRegistration) update result:", { id: data?.id, tokenLen: data?.fcm_token?.length, error: error?.message });
          if (error) {
            finish(false, error.message);
            return;
          }
          if (!data?.id) {
            finish(false, "Could not update profile (RLS/auth). Make sure you are logged in and profiles row exists.");
            return;
          }
          finish(true);
        };

        window.addEventListener("CapacitorFCMTokenReceived", onFcmToken as EventListener);

        // Also poll localStorage in case the native event fired before JS listener was attached.
        const pollId = setInterval(() => {
          try {
            const cached = localStorage.getItem(LAST_FCM_TOKEN_KEY)?.trim();
            if (cached && !/^[0-9A-Fa-f]{64}$/.test(cached)) {
              void supabase
                .from("profiles")
                .update({ fcm_token: cached })
                .eq("id", userId)
                .select("id,fcm_token")
                .maybeSingle()
                .then(({ data, error }) => {
                  if (!error && data?.id) finish(true);
                });
            }
          } catch {
            // ignore
          }
        }, 600);

        const t = setTimeout(
          () => finish(false, toFriendlyError(new Error("Registration timeout — ensure Push Notifications capability + FirebaseMessaging are set, and try again."))),
          45000
        );

        // Trigger APNs registration; Firebase will then exchange for FCM token
        setTimeout(() => {
          void PushNotifications.register();
        }, 400);
      });
    } else {
      // Android: @capacitor/push-notifications returns the FCM token directly
      return new Promise((resolve) => {
        let settled = false;
        const finish = (ok: boolean, error?: string) => {
          if (settled) return;
          settled = true;
          clearTimeout(t);
          void PushNotifications.removeAllListeners().catch(() => {});
          resolve({ ok, error });
        };

        const onToken = async (token: { value: string }) => {
          const { error } = await supabase
            .from("profiles")
            .update({ fcm_token: token.value })
            .eq("id", userId);
          finish(!error, error?.message);
        };

        const onErr = (err: { error: string }) =>
          finish(false, toFriendlyError(new Error(err.error)));

        void PushNotifications.addListener("registration", onToken);
        void PushNotifications.addListener("registrationError", onErr);
        const t = setTimeout(
          () => finish(false, toFriendlyError(new Error("Registration timeout"))),
          20000
        );

        setTimeout(() => {
          void PushNotifications.register();
        }, 400);
      });
    }
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
