import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useInAppPurchase } from "@/hooks/useInAppPurchase";
import { createNotificationForUser } from "@/hooks/useNotifications";
import { Lock } from "lucide-react";

const MOODS = [
  { emoji: "😍", label: "Amazing" },
  { emoji: "😊", label: "Good" },
  { emoji: "😐", label: "Meh" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🔥", label: "Passionate" },
  { emoji: "😴", label: "Tired" },
];

const MoodScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, partner, refetch } = useProfile();
  const { isPremium } = useInAppPurchase();
  const isPremiumUser = isPremium || profile?.subscription_status === "active" || profile?.subscription_status === "premium";
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [justSelected, setJustSelected] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.current_mood) setSelectedMood(profile.current_mood);
  }, [profile?.current_mood]);

  const handleMoodSelect = (emoji: string) => {
    setSelectedMood(emoji);
    setJustSelected(true);
  };

  const handleShareMood = async () => {
    if (!user || !selectedMood) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({ current_mood: selectedMood })
      .eq("id", user.id);

    if (profile?.partner_id) {
      const label = MOODS.find((m) => m.emoji === selectedMood)?.label || "something";
      createNotificationForUser(
        profile.partner_id,
        "mood_update",
        `${profile.name || "Your partner"} is feeling ${label}`,
        `They shared their mood with you 💕`,
        { mood: selectedMood, label }
      ).catch(() => {});
    }

    setSaving(false);
    setJustSelected(false);
    setShowSent(true);
    refetch();
    setTimeout(() => setShowSent(false), 1200);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col mesh-bg noise-overlay vignette pb-28">
      <div className="flex items-center justify-between px-5 pt-20 pb-5 relative z-10">
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Mood</h1>
      </div>

      <div className="px-5 flex flex-col gap-6 relative z-10">
        {/* My mood */}
        <motion.div
          className="glass-card-futuristic gradient-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-1">
            HOW ARE YOU FEELING?
          </p>
          <p className="text-[13px] font-body text-muted-foreground mb-4">
            {partner ? `${partner.name} will see your mood` : "Your partner will see your mood"}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {MOODS.map((mood, i) => (
              <motion.button
                key={mood.emoji}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleMoodSelect(mood.emoji)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col items-center gap-2 py-4 rounded-card transition-all duration-200 ${
                  selectedMood === mood.emoji
                    ? "glass-card border-primary bg-primary/[0.1] glow-rose"
                    : "glass-card hover:border-white/10"
                }`}
                style={{ width: "100%", height: 70 }}
              >
                <span className="text-[28px]">{mood.emoji}</span>
                <span className="text-[10px] font-body font-medium text-muted-foreground">{mood.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Share Mood button */}
          <AnimatePresence>
            {justSelected && selectedMood && (
              <motion.button
                onClick={handleShareMood}
                className="w-full mt-5 py-3.5 rounded-[20px] font-heading font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, hsl(160, 84%, 64%), hsl(160, 70%, 55%))",
                  color: "#07070E",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                {saving ? "Saving..." : "Share Mood ✓"}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Partner mood */}
        <motion.div
          className="glass-card-futuristic gradient-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-4">
            {partner ? `${partner.name.toUpperCase()}'S MOOD` : "PARTNER'S MOOD"}
          </p>
          {partner?.current_mood ? (
            <div className="flex items-center gap-4">
              <motion.span
                className="text-5xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {partner.current_mood}
              </motion.span>
              <div>
                <p className="text-lg font-heading font-bold text-foreground">
                  {MOODS.find((m) => m.emoji === partner.current_mood)?.label || "Feeling something"}
                </p>
                <p className="text-xs font-body text-muted-foreground">Updated recently</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-3">🔒</span>
              <p className="text-sm font-body text-muted-foreground">
                {partner ? `${partner.name} hasn't shared yet` : "Connect with a partner to see their mood"}
              </p>
            </div>
          )}
        </motion.div>

        {/* Premium: full mood history — free users see teaser */}
        {!isPremiumUser && (
          <motion.button
            onClick={() => navigate("/paywall")}
            className="glass-card-elevated p-4 flex items-center gap-3 text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-foreground text-sm">Full mood history & trends</p>
              <p className="text-xs font-body text-muted-foreground">Unlock with Premium to see history and &quot;mood together&quot; views</p>
            </div>
          </motion.button>
        )}
      </div>

      {/* Sent overlay */}
      <AnimatePresence>
        {showSent && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card-elevated px-10 py-6 text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <span className="text-4xl block mb-2">💚</span>
              <p className="font-heading font-bold text-lg text-foreground">Sent!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodScreen;
