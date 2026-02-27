import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

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

function getDistanceLevel(km: number | null): {
  label: string;
  emoji: string;
  gradient: string;
  iconGlow: string;
  progress: number;
} {
  if (km === null)
    return { label: "Locating…", emoji: "📍", gradient: "from-muted to-muted", iconGlow: "", progress: 0 };
  if (km < 0.1)
    return { label: "Right here!", emoji: "🫂", gradient: "from-accent to-accent/60", iconGlow: "glow-mint-strong", progress: 100 };
  if (km < 1)
    return { label: "Very close", emoji: "🏃", gradient: "from-accent to-lavender/60", iconGlow: "glow-mint", progress: 85 };
  if (km < 10)
    return { label: "Nearby", emoji: "🚶", gradient: "from-lavender to-primary/60", iconGlow: "glow-lavender", progress: 65 };
  if (km < 50)
    return { label: "Same city", emoji: "🏙️", gradient: "from-amber to-primary/60", iconGlow: "glow-amber", progress: 45 };
  if (km < 200)
    return { label: "A drive away", emoji: "🚗", gradient: "from-amber/80 to-coral/60", iconGlow: "glow-amber", progress: 30 };
  if (km < 1000)
    return { label: "Far apart", emoji: "✈️", gradient: "from-primary to-lavender/60", iconGlow: "glow-rose", progress: 15 };
  return { label: "Long distance", emoji: "🌍", gradient: "from-primary to-coral/60", iconGlow: "glow-rose-strong", progress: 5 };
}

const DistanceBanner: React.FC<DistanceBannerProps> = ({ distance, partnerName, partnerMood }) => {
  const formatted = formatDistance(distance);
  const level = getDistanceLevel(distance);

  return (
    <motion.div
      className="glass-card-elevated relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Top gradient accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${level.gradient} opacity-60`} />

      <div className="p-5">
        {/* Main row */}
        <div className="flex items-center gap-4">
          {/* Location icon */}
          <motion.div
            className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${level.gradient} flex items-center justify-center shrink-0 ${level.iconGlow}`}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Navigation className="w-5 h-5 text-foreground" strokeWidth={2.5} />
            {/* Live indicator dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-background" />
          </motion.div>

          {/* Distance info */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-0.5">
              {level.label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-heading font-extrabold text-foreground leading-none">
                {formatted}
              </span>
              <span className="text-xs font-body text-muted-foreground">away</span>
            </div>
          </div>

          {/* Partner mood */}
          <div className="flex flex-col items-center gap-1">
            <motion.div
              className="w-11 h-11 rounded-2xl bg-secondary/60 flex items-center justify-center"
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-xl">{partnerMood || "🔒"}</span>
            </motion.div>
            <span className="text-[9px] font-body text-muted-foreground truncate max-w-[60px]">
              {partnerName}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        {distance !== null && (
          <div className="mt-4">
            <div className="w-full h-1 rounded-full bg-secondary/40 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${level.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${level.progress}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] font-body text-muted-foreground">🌍 Far</span>
              <span className="text-[9px] font-body text-muted-foreground">🫂 Close</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DistanceBanner;
