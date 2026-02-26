import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "🥰", label: "Loved" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😴", label: "Tired" },
];

const MoodScreen: React.FC = () => {
  const { user } = useAuth();
  const { profile, partner, refetch } = useProfile();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.current_mood) setSelectedMood(profile.current_mood);
  }, [profile?.current_mood]);

  const handleMoodSelect = async (emoji: string) => {
    if (!user) return;
    setSaving(true);
    setSelectedMood(emoji);

    const { error } = await supabase
      .from("profiles")
      .update({ current_mood: emoji })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save mood");
    } else {
      toast.success("Mood updated!");
      refetch();
    }
    setSaving(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col mesh-bg noise-overlay vignette pb-24">
      <div className="flex items-center justify-between px-5 pt-14 pb-5 relative z-10">
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Mood</h1>
      </div>

      <div className="px-5 flex flex-col gap-6 relative z-10">
        {/* My mood */}
        <motion.div
          className="glass-card-elevated p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-4">
            HOW ARE YOU FEELING?
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
                    ? "glass-card border-accent bg-accent/[0.08] glow-mint"
                    : "glass-card hover:border-white/10"
                }`}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className="text-xs font-body font-medium text-muted-foreground">{mood.label}</span>
                {selectedMood === mood.emoji && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-accent"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Partner mood */}
        <motion.div
          className="glass-card-elevated p-6"
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
      </div>
    </div>
  );
};

export default MoodScreen;
