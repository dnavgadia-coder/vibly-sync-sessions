import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type NotificationType = "partner_answered" | "streak_reminder" | "weekly_ready" | "couple_close" | "mood_update" | "partner_joined" | "general";

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
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.warn("[notifications] fetch error", error);
      setLoading(false);
      return;
    }
    const list = (data || []).map((row) => ({
      ...row,
      data: (row.data as Record<string, unknown>) || {},
    })) as AppNotification[];
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.read_at).length);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => fetchNotifications()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => fetchNotifications()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!user) return;
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnreadCount(0);
  }, [user]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications };
}

/** Create a notification for another user (e.g. partner). Call from client when the current user is the partner. */
export async function createNotificationForUser(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string | null,
  data?: Record<string, unknown>
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body: body ?? null,
    data: data ?? {},
  });
  if (error) return { error: new Error(error.message) };

  supabase.functions.invoke("send-push", {
    body: { user_id: userId, title, body: body ?? "" },
  }).then(() => {}).catch(() => {});

  return { error: null };
}
