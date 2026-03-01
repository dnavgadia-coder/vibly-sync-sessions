import { useState, useCallback } from "react";
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

/**
 * Notifications hook — currently a stub because the `notifications` table
 * has not been created yet.  All methods are no-ops that return safe defaults.
 */
export function useNotifications() {
  const { user } = useAuth();
  const [notifications] = useState<AppNotification[]>([]);
  const [unreadCount] = useState(0);
  const [loading] = useState(false);

  const markAsRead = useCallback(async (_id: string) => {}, []);
  const markAllAsRead = useCallback(async () => {}, []);
  const refetch = useCallback(async () => {}, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch };
}

/** Stub — will work once a notifications table is created. */
export async function createNotificationForUser(
  userId: string,
  _type: NotificationType,
  title: string,
  body?: string | null,
  _data?: Record<string, unknown>
): Promise<{ error: Error | null }> {
  // Best-effort push via edge function even without a notifications table
  supabase.functions.invoke("send-push", {
    body: { user_id: userId, title, body: body ?? "" },
  }).catch(() => {});

  return { error: null };
}
