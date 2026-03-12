import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell, Check, BellOff } from "lucide-react";
import ViblyButton from "@/components/ViblyButton";
import { useNotifications } from "@/hooks/useNotifications";
import { usePushRegistration, getPushPermissionState } from "@/hooks/usePushRegistration";
import type { AppNotification } from "@/hooks/useNotifications";
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

function formatNotificationTime(createdAt: string): string {
  const d = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function notifIcon(type: string): string {
  switch (type) {
    case "partner_answered":  return "💬";
    case "mood_update":       return "💚";
    case "partner_joined":    return "💑";
    case "streak_reminder":   return "🔥";
    case "weekly_ready":      return "📊";
    case "couple_close":      return "📍";
    default:                  return "🔔";
  }
}

const NotificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const { registerAndSaveToken } = usePushRegistration();
  const [registering, setRegistering] = useState(false);
  const [pushState, setPushState] = useState<"unknown" | "prompt" | "granted" | "denied">("unknown");

  // Check push permission state on mount so we can show / hide the permission card
  useEffect(() => {
    if (!isNative) { setPushState("unknown"); return; }
    getPushPermissionState().then(setPushState);
  }, []);

  const handleAllow = async () => {
    setRegistering(true);
    try {
      const result = await registerAndSaveToken();
      if (result.error && result.error !== "Permission denied") {
        toast.error(result.error, { duration: 6000 });
      } else if (result.ok) {
        toast.success("Notifications enabled! 🔔");
        setPushState("granted");
      }
      navigate("/home");
    } catch {
      toast.error("Could not enable notifications");
    } finally {
      setRegistering(false);
    }
  };

  const handleNotNow = () => navigate("/home");

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-20 pb-8 mesh-bg noise-overlay vignette">
      <div className="flex-1 flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-body font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              {unreadCount} unread
            </span>
          )}
        </div>
        <p className="text-sm font-body text-muted-foreground mb-6">
          Reminders and updates from Vibly
        </p>

        {/* Mark all read shortcut */}
        {unreadCount > 0 && (
          <motion.div
            className="flex justify-end mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs font-body font-medium text-primary"
            >
              Mark all as read
            </button>
          </motion.div>
        )}

        {/* In-app notifications list */}
        {!loading && notifications.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col gap-2">
              {notifications.slice(0, 30).map((n) => (
                <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <p className="font-heading font-bold text-foreground mb-1">No notifications yet</p>
            <p className="text-xs font-body text-muted-foreground max-w-[240px]">
              You'll see when your partner answers, when your streak is at risk, and more
            </p>
          </motion.div>
        )}

        {/* Push permission card — only shown when native and permission not yet granted */}
        {isNative && pushState !== "granted" && pushState !== "denied" && (
          <motion.div
            className="mt-auto glass-card-elevated p-5 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl mt-0.5">🔔</span>
              <div>
                <p className="font-heading font-bold text-foreground">Don't miss a moment</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">
                  Know when your partner answers, when your streak is at risk, and when your weekly card is ready.
                </p>
              </div>
            </div>
            {/* What you'll get */}
            <div className="flex flex-col gap-1.5 mb-4 pl-1">
              {[
                { icon: "💬", text: "Partner answered today's question" },
                { icon: "💑", text: "New partner connection" },
                { icon: "💚", text: "Partner shared their mood" },
                { icon: "🔥", text: "Streak reminders" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="text-[12px] font-body text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <ViblyButton onClick={handleAllow} disabled={registering}>
                {registering ? "Enabling…" : "Allow Notifications"}
              </ViblyButton>
              <button
                onClick={handleNotNow}
                className="w-full py-3 text-sm font-body text-muted-foreground text-center glass-card rounded-pill"
              >
                Not now
              </button>
            </div>
          </motion.div>
        )}

        {/* Already granted */}
        {isNative && pushState === "granted" && (
          <motion.div
            className="mt-auto glass-card p-4 rounded-2xl flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-heading font-bold text-foreground text-sm">Notifications enabled</p>
              <p className="text-xs font-body text-muted-foreground">You'll be notified for all important moments</p>
            </div>
          </motion.div>
        )}

        {/* Denied state */}
        {isNative && pushState === "denied" && (
          <motion.div
            className="mt-auto glass-card p-4 rounded-2xl flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-9 h-9 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
              <BellOff className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-heading font-bold text-foreground text-sm">Notifications blocked</p>
              <p className="text-xs font-body text-muted-foreground">
                Go to Settings → Vibly → Notifications to re-enable
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  const isUnread = !notification.read_at;
  return (
    <motion.button
      type="button"
      onClick={() => { if (isUnread) onMarkRead(notification.id); }}
      className={`glass-card p-4 rounded-xl text-left w-full transition-colors ${
        isUnread ? "border-l-4 border-l-primary/60" : ""
      }`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{notifIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-foreground text-sm leading-tight">
            {notification.title}
          </p>
          {notification.body && (
            <p className="text-xs font-body text-muted-foreground mt-0.5 line-clamp-2">
              {notification.body}
            </p>
          )}
          <p className="text-[10px] font-body text-muted-foreground/70 mt-1.5">
            {formatNotificationTime(notification.created_at)}
          </p>
        </div>
        {isUnread && (
          <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
        )}
      </div>
    </motion.button>
  );
}

export default NotificationScreen;
