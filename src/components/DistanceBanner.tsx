import React from "react";
import { motion } from "framer-motion";

interface DistanceBannerProps {
  distance: number | null;
  partnerName: string;
  partnerMood: string | null;
}

function formatDistance(km: number | null): string {
  if (km === null || km === undefined) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

function getDistanceLevel(km: number | null): { label: string; emoji: string; color: string; progress: number } {
  if (km === null) return { label: "Unknown", emoji: "📍", color: "text-muted-foreground", progress: 0 };
  if (km < 0.1) return { label: "Right here!", emoji: "🫂", color: "text-accent text-glow-mint", progress: 100 };
  if (km < 1) return { label: "Very close", emoji: "🏃", color: "text-accent", progress: 85 };
  if (km < 10) return { label: "Nearby", emoji: "🚶", color: "text-lavender", progress: 65 };
  if (km < 50) return { label: "Same city", emoji: "🏙️", color: "text-amber text-glow-amber", progress: 45 };
  if (km < 200) return { label: "A drive away", emoji: "🚗", color: "text-amber", progress: 30 };
  if (km < 1000) return { label: "Far apart", emoji: "✈️", color: "text-primary", progress: 15 };
  return { label: "Long distance", emoji: "🌍", color: "text-primary text-glow-rose", progress: 5 };
}

const DistanceBanner: React.FC<DistanceBannerProps> = ({ distance, partnerName, partnerMood }) => {
  const formatted = formatDistance(distance);
  const level = getDistanceLevel(distance);

  return (
    <motion.div
      className="glass-card-elevated p-5 light-sweep animate-breathe"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/12 flex items-center justify-center glow-rose">
            <span className="text-lg">{level.emoji}</span>
          </div>
          <div>
            <p className="text-xs font-body text-muted-foreground mb-0.5">{level.label}</p>
            <p className={`text-lg font-heading font-bold ${level.color}`}>
              {formatted}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-body text-muted-foreground mb-0.5">
            {partnerName}'s mood
          </p>
          <motion.p
            className="text-2xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {partnerMood || "🔒"}
          </motion.p>
        </div>
      </div>

      {/* Distance progress bar */}
      {distance !== null && (
        <div className="relative">
          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-lavender to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${level.progress}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] font-body text-muted-foreground">🌍 Far</span>
            <span className="text-[9px] font-body text-muted-foreground">🫂 Close</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DistanceBanner;
