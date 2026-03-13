import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type NotificationType =
  | "partner_answered"
  | "streak_reminder"
  | "weekly_ready"
  | "couple_close"
  | "mood_update"
  | "partner_joined"
  | "general";

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(data as AppNotification[]);
        setUnreadCount(data.filter((n) => !n.read_at).length);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    void fetchNotifications();

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as AppNotification, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user?.id ?? "");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    [user?.id]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    const now = new Date().toISOString();
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", user.id)
      .is("read_at", null);
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    setUnreadCount(0);
  }, [user?.id]);

  const refetch = useCallback(() => fetchNotifications(), [fetchNotifications]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch };
}

/**
 * Creates an in-app notification row AND fires a push notification to the user's device.
 * Inserting into the notifications table also triggers the Supabase DB webhook
 * (if configured) which calls the send-push Edge Function automatically.
 * As a fallback, we also call the Edge Function directly.
 */
export async function createNotificationForUser(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string | null,
  data?: Record<string, unknown>
): Promise<{ error: Error | null }> {
  try {
    // Insert into notifications table (triggers realtime + optional DB webhook)
    await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      body: body ?? null,
      data: data ?? {},
    } as any);
  } catch {
    // Non-fatal — still attempt push delivery below
  }

  // Also call the Edge Function directly as a reliable fallback.
  // Pass notif_type and data so FCM includes them in the notification payload,
  // enabling deep-link navigation when the user taps the notification.
  supabase.functions
    .invoke("send-push", {
      body: {
        user_id: userId,
        title,
        body: body ?? "",
        notif_type: type,
        data: data ?? {},
      },
    })
    .catch(() => {});

  return { error: null };
}
