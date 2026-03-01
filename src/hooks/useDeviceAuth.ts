import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEVICE_ID_KEY = "vibly_device_id";
const FALLBACK_PWD = "vibly_mvp_2026!";

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function deviceEmail(deviceId: string): string {
  return `${deviceId}@device.vibly.app`;
}

export function useDeviceAuth() {
  const [loading, setLoading] = useState(false);

  const ensureDeviceAccount = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();
      const email = deviceEmail(deviceId);

      // Try sign in first
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: FALLBACK_PWD,
      });

      if (!signInErr && signInData.user) {
        return true;
      }

      // Try sign up
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password: FALLBACK_PWD,
      });

      if (signUpErr) {
        // If user exists but password wrong, reset via edge function
        const resetRes = await supabase.functions.invoke("reset-fallback-pwd", {
          body: { email },
        });

        if (resetRes.data?.exists) {
          const { error: retryErr } = await supabase.auth.signInWithPassword({
            email,
            password: FALLBACK_PWD,
          });
          return !retryErr;
        }
        return false;
      }

      return !!signUpData.user;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { ensureDeviceAccount, loading };
}
