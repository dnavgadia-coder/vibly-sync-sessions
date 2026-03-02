import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDeviceAuth } from "@/hooks/useDeviceAuth";

/**
 * Wraps protected screens. If no user session exists, silently creates
 * a device-based account in the background. Shows a spinner while working.
 */
export function SilentAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { ensureDeviceAccount, loading: deviceLoading } = useDeviceAuth();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setAttempted(true);
      return;
    }
    // No user — silently create device account
    ensureDeviceAccount().then(() => setAttempted(true));
  }, [authLoading, user, ensureDeviceAccount]);

  if (authLoading || !attempted || deviceLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center mesh-bg noise-overlay vignette">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
