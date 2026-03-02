import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell, Check } from "lucide-react";
import ViblyButton from "@/components/ViblyButton";
import { useNotifications } from "@/hooks/useNotifications";
import { usePushRegistration } from "@/hooks/usePushRegistration";
import type { AppNotification } from "@/hooks/useNotifications";

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

const NotificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const { registerAndSaveToken } = usePushRegistration();
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [registering, setRegistering] = useState(false);

  const handleAllow = async () => {
    setRegistering(true);
    try {
      const result = await registerAndSaveToken();
      if (result.error && result.error !== "Permission denied") {
        toast.error(result.error, { duration: 6000 });
      } else if (result.ok) {
        toast.success("Notifications enabled");
      }
      setPermissionAsked(true);
      navigate("/home");
    } catch {
      toast.error("Could not enable notifications");
    } finally {
      setRegistering(false);
    }
  };

  const handleNotNow = () => {
    setPermissionAsked(true);
    navigate("/home");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-20 pb-8 mesh-bg noise-overlay vignette">
      <div className="flex-1 flex flex-col relative z-10">
        <h1 className="font-heading font-extrabold text-2xl text-foreground mb-1">Notifications</h1>
        <p className="text-sm font-body text-muted-foreground mb-6">
          Reminders and updates from Vibly
        </p>

        {/* In-app notifications list */}
        {!loading && notifications.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
                Recent
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs font-body font-medium text-primary"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {notifications.slice(0, 20).map((n) => (
                <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} />
              ))}
            </div>
          </motion.div>
        )}

        {!loading && notifications.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-primary" />
            </div>
            <p className="font-body text-muted-foreground text-sm">No notifications yet</p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              You’ll see when your partner answers, streak reminders, and more
            </p>
          </motion.div>
        )}

        {/* Push permission card */}
        <motion.div
          className="mt-auto glass-card-elevated p-5 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-heading font-bold text-foreground">Don’t miss a moment</p>
              <p className="text-xs font-body text-muted-foreground">
                Get reminders when your partner answers, when your streak is at risk, and when your weekly card is ready.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
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
      onClick={() => {
        if (isUnread) onMarkRead(notification.id);
      }}
      className={`glass-card p-4 rounded-xl text-left w-full transition-colors ${isUnread ? "border-l-4 border-l-primary/50" : ""}`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-foreground text-sm leading-tight">
            {notification.title}
          </p>
          {notification.body && (
            <p className="text-xs font-body text-muted-foreground mt-0.5 line-clamp-2">
              {notification.body}
            </p>
          )}
          <p className="text-[10px] font-body text-muted-foreground/70 mt-2">
            {formatNotificationTime(notification.created_at)}
          </p>
        </div>
        {isUnread && (
          <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center" title="Unread">
            <Check className="w-3 h-3 text-primary" />
          </span>
        )}
      </div>
    </motion.button>
  );
};

export default NotificationScreen;
