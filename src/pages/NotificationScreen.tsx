import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViblyButton from "@/components/ViblyButton";

const NotificationScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleAllow = async () => {
    try {
      if ("Notification" in window) {
        await Notification.requestPermission();
      }
    } catch {
      // ignore
    }
    navigate("/home");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
        {/* Emoji row */}
        <motion.div
          className="flex items-center gap-2 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.34, 1.56, 0.64, 1] }}
        >
          <span className="text-[28px]">💚</span>
          <span className="text-sm text-muted-foreground">→</span>
          <span className="text-[28px]">💛</span>
          <span className="text-sm text-muted-foreground">→</span>
          <span className="text-[28px]">💔</span>
          <span className="text-sm text-muted-foreground">→</span>
          <span className="text-[28px]">🪦</span>
        </motion.div>

        <motion.h2
          className="font-heading font-bold text-[24px] text-foreground mb-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          Don't let your vibe die
        </motion.h2>

        <motion.p
          className="text-sm font-body text-muted-foreground max-w-[300px] leading-relaxed mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Get reminders when your partner answers, when your streak is at risk, and when your weekly card is ready.
        </motion.p>
      </div>

      <motion.div
        className="relative z-10 flex flex-col gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ViblyButton onClick={handleAllow}>
          Allow Notifications
        </ViblyButton>
        <button
          onClick={() => navigate("/home")}
          className="w-full py-3 text-sm font-body text-muted-foreground text-center glass-card rounded-pill"
        >
          Not now
        </button>
      </motion.div>
    </div>
  );
};

export default NotificationScreen;
