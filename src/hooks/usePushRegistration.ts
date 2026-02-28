import { useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const isNative = Capacitor.isNativePlatform();

function toFriendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/plugin|not set|not installed|unavailable/i.test(msg)) {
    return "Enable Push Notifications in Xcode (Signing & Capabilities) and run on a real device.";
  }
  if (/timeout/i.test(msg)) return "Registration is taking longer than usual. Try again in a moment.";
  return msg || "Push registration failed";
}

/**
 * Register for push notifications (native only), get the device token,
 * and save it to profiles.fcm_token so the backend can send push.
 * On iOS: APNs token. On Android: FCM token.
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
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const permStatus = await PushNotifications.checkPermissions();
    const status = permStatus.receive === "prompt" ? (await PushNotifications.requestPermissions()).receive : permStatus.receive;
    if (status !== "granted") {
      return { ok: false, error: "Permission denied" };
    }

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
        const { error } = await supabase.from("profiles").update({ fcm_token: token.value }).eq("id", userId);
        finish(!error, error?.message);
      };
      const onErr = (err: { error: string }) => finish(false, toFriendlyError(new Error(err.error)));
      void PushNotifications.addListener("registration", onToken);
      void PushNotifications.addListener("registrationError", onErr);
      const t = setTimeout(() => finish(false, toFriendlyError(new Error("Registration timeout"))), 20000);
      setTimeout(() => {
        void PushNotifications.register();
      }, 400);
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
