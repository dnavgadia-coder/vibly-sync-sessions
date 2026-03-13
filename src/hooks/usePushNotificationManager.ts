/**
 * Global push notification manager — mount once inside the Router so it has
 * access to useNavigate. Handles:
 *
 * 1. Auto-register FCM token on every app start (if permission already granted)
 * 2. Save FCM token from AppDelegate's MessagingDelegate (iOS) on CapacitorFCMTokenReceived event
 * 3. Save FCM token from the registration event (Android) whenever it is refreshed
 * 4. Show an in-app toast when a push notification arrives in the foreground
 * 5. Navigate to the right screen when the user taps a notification
 *
 * Each profile row has its own fcm_token. Both users in a couple must allow
 * notifications on their own device so both rows get a token.
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getPushPermissionState } from "./usePushRegistration";

const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform();

const LAST_FCM_TOKEN_KEY = "vibly_last_fcm_token";

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

/** 64 hex chars = APNs device token; we must only store FCM tokens in fcm_token. */
function isLikelyApnsToken(token: string): boolean {
  return /^[0-9A-Fa-f]{64}$/.test(token.trim());
}

/** Save APNs device token to profiles.fcm_token (iOS only). */
async function saveApnsTokenToProfile(userId: string, token: string): Promise<{ ok: boolean; error?: string }> {
  if (!token?.trim() || !isLikelyApnsToken(token)) return { ok: false, error: "Not an APNs token" };
  // Store APNs token in fcm_token field as a fallback (prefixed to distinguish)
  const { error } = await supabase
    .from("profiles")
    .update({ fcm_token: `apns:${token.trim()}` })
    .eq("id", userId);
  if (error) {
    console.error("[Vibly] Failed to save APNs token:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Save FCM token to profiles.fcm_token only. If token looks like APNs, save to apns_token instead and do not touch fcm_token. */
async function saveFcmTokenToProfile(userId: string, token: string): Promise<{ ok: boolean; error?: string }> {
  if (!token?.trim()) return { ok: false, error: "Empty token" };
  if (isLikelyApnsToken(token)) {
    console.warn("[Vibly] Token is APNs (64 hex); saving to apns_token only, not fcm_token.");
    return saveApnsTokenToProfile(userId, token);
  }
  console.log("[Vibly] Saving FCM token for user:", userId, "tokenLen=", token.trim().length);
  const { data, error } = await supabase
    .from("profiles")
    .update({ fcm_token: token.trim() })
    .eq("id", userId)
    .select("id,fcm_token")
    .maybeSingle();
  if (error) {
    console.error("[Vibly] Failed to save FCM token:", error.message);
    return { ok: false, error: error.message };
  }
  if (!data?.id) {
    console.error("[Vibly] Token update returned no row (possible RLS/auth mismatch).");
    return { ok: false, error: "Update returned no row (check auth / RLS)" };
  }
  console.log("[Vibly] FCM token saved to profile", data.id, "tokenLen=", data.fcm_token?.length);
  return { ok: true };
}

export function usePushNotificationManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pendingTokenRef = useRef<string | null>(null);

  // ── 1. Auto-register on every app start ─────────────────────────────────────
  useEffect(() => {
    if (!isNative || !user?.id) return;
    const autoRegister = async () => {
      try {
        const state = await getPushPermissionState();
        if (state !== "granted") return;
        const { PushNotifications } = await import("@capacitor/push-notifications");
        await PushNotifications.register();
      } catch {
        // Silent — this is a best-effort background refresh
      }
    };
    void autoRegister();
  }, [user?.id]);

  // ── 2. iOS — save FCM from AppDelegate (CapacitorFCMTokenReceived); save APNs from plugin "registration" ─────
  useEffect(() => {
    if (!isNative || platform !== "ios") return;
    const onFcmToken = (e: Event) => {
      const token = extractTokenFromEventDetail((e as CustomEvent).detail);
      if (!token?.trim()) return;
      try {
        localStorage.setItem(LAST_FCM_TOKEN_KEY, token.trim());
      } catch {}
      pendingTokenRef.current = token;
      if (user?.id) {
        saveFcmTokenToProfile(user.id, token).then(() => {
          pendingTokenRef.current = null;
        });
      }
    };
    window.addEventListener("CapacitorFCMTokenReceived", onFcmToken);
    return () => window.removeEventListener("CapacitorFCMTokenReceived", onFcmToken);
  }, [user?.id]);

  // iOS: plugin "registration" delivers APNs token (64 hex) — save to apns_token only, never fcm_token.
  useEffect(() => {
    if (!isNative || platform !== "ios" || !user?.id) return;
    let remove: (() => void) | null = null;
    const setup = async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const handle = await PushNotifications.addListener("registration", async (payload: { value?: string }) => {
          const token = payload.value?.trim();
          if (token && isLikelyApnsToken(token)) {
            await saveApnsTokenToProfile(user.id, token);
          }
        });
        remove = () => handle.remove();
      } catch {}
    };
    void setup();
    return () => remove?.();
  }, [user?.id]);

  // Flush pending FCM token when user becomes available (e.g. token arrived before auth).
  useEffect(() => {
    if (!isNative || !user?.id) return;
    const pending = pendingTokenRef.current;
    if (!pending) return;
    pendingTokenRef.current = null;
    void saveFcmTokenToProfile(user.id, pending);
  }, [user?.id]);

  // ── 3. Android — save FCM token from the registration event ──────────────────
  useEffect(() => {
    if (!isNative || platform !== "android" || !user?.id) return;
    let removeListener: (() => void) | null = null;
    const setup = async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const handle = await PushNotifications.addListener("registration", async ({ value: token }) => {
          if (!user?.id) return;
          await saveFcmTokenToProfile(user.id, token);
        });
        removeListener = () => handle.remove();
      } catch {
        // Plugin not available (e.g. web)
      }
    };
    void setup();
    return () => removeListener?.();
  }, [user?.id]);

  // ── 4. Foreground notification — show in-app toast ───────────────────────────
  // On iOS: Capacitor's presentationOptions config already shows the system banner.
  // This listener ALSO shows an in-app toast so the user sees it inside the app UI.
  useEffect(() => {
    if (!isNative) return;
    let removeListener: (() => void) | null = null;
    const setup = async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const handle = await PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            const title = notification.title ?? "Vibly";
            const body = notification.body ?? "";
            toast(title, {
              description: body || undefined,
              duration: 5000,
              action: {
                label: "View",
                onClick: () => navigate("/notification"),
              },
            });
          }
        );
        removeListener = () => handle.remove();
      } catch {
        // Plugin not available
      }
    };
    void setup();
    return () => removeListener?.();
  }, [navigate]);

  // ── 5. Notification tap — navigate to the right screen ────────────────────────
  // When user taps a notification we navigate by type. Two paths:
  // (a) Capacitor plugin "pushNotificationActionPerformed" (Android / when plugin is delegate)
  // (b) Custom "CapacitorPushNotificationTapped" (iOS when we are UNUserNotificationCenter delegate)
  const handleNotificationTap = (type: string) => {
    switch (type) {
      case "partner_answered":
      case "partner_joined":
      case "mood_update":
      case "streak_reminder":
        navigate("/home");
        break;
      default:
        navigate("/notification");
    }
  };

  useEffect(() => {
    if (!isNative) return;
    let removeListener: (() => void) | null = null;
    const setup = async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const handle = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action: { notification?: { data?: Record<string, string> } }) => {
            const data = action.notification?.data ?? {};
            handleNotificationTap(data.type ?? "general");
          }
        );
        removeListener = () => handle.remove();
      } catch {
        // Plugin not available
      }
    };
    void setup();
    return () => removeListener?.();
  }, [navigate]);

  // iOS: AppDelegate forwards tap to this custom event (we are UNUserNotificationCenter delegate)
  useEffect(() => {
    if (!isNative) return;
    const onTapped = (e: Event) => {
      const detail = (e as CustomEvent<{ type?: string }>).detail;
      handleNotificationTap(detail?.type ?? "general");
    };
    window.addEventListener("CapacitorPushNotificationTapped", onTapped);
    return () => window.removeEventListener("CapacitorPushNotificationTapped", onTapped);
  }, [navigate]);
}
