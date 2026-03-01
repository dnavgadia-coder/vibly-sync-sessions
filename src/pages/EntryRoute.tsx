import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SplashScreen from "./SplashScreen";

/**
 * Handles app entry at "/". If user is logged in, redirect to /home or /name
 * so they don't see onboarding again after restart. If not logged in, show marketing splash.
 */
export default function EntryRoute() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checkDone, setCheckDone] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCheckDone(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        setCheckDone(true);
        if (prof?.name) navigate("/home", { replace: true });
        else navigate("/name", { replace: true });
      } catch {
        if (!cancelled) setCheckDone(true);
      }
    })();
    return () => { cancelled = true; };
  }, [authLoading, user, navigate]);

  if (authLoading || !checkDone) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center mesh-bg noise-overlay vignette">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center mesh-bg noise-overlay vignette">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <SplashScreen />;
}
