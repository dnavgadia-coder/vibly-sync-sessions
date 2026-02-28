import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const retryRef = useRef(false);

  const tryRestoreSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user && event !== "INITIAL_SESSION") {
        retryRef.current = false;
      }
    });

    tryRestoreSession();

    let onlineTimeoutId: ReturnType<typeof setTimeout> | undefined;
    const onOnline = () => {
      if (retryRef.current) return;
      retryRef.current = true;
      onlineTimeoutId = setTimeout(async () => {
        await tryRestoreSession();
        retryRef.current = false;
      }, 1500);
    };
    window.addEventListener("online", onOnline);

    const retryOnce = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) setUser(session.user);
        setLoading(false);
      });
    }, 2500);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("online", onOnline);
      if (onlineTimeoutId !== undefined) clearTimeout(onlineTimeoutId);
      clearTimeout(retryOnce);
    };
  }, []);

  return { user, loading };
}
