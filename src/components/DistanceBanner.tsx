import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";

interface DistanceBannerProps {
  distance: number | null;
  partnerName: string;
  partnerMood: string | null;
}

function formatDistance(km: number | null): string {
  if (km === null || km === undefined) return "—";
  if (km < 0.001) return "< 1 m";
  if (km < 1) return `${(km * 1000).toFixed(1).replace(/\.0$/, "")} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Closeness progress from actual distance: 0 = 100%, 20 km = 0%. Linear scale. */
function getClosenessProgress(km: number | null): number {
  if (km === null) return 0;
  return Math.max(0, Math.min(100, 100 - (km / 20) * 100));
}

function getDistanceLevel(km: number | null): {
  label: string;
  emoji: string;
  gradient: string;
  iconGlow: string;
  progress: number;
} {
  const progress = getClosenessProgress(km);
  if (km === null)
    return { label: "Locating…", emoji: "📍", gradient: "from-muted to-muted", iconGlow: "", progress: 0 };
  if (km < 0.1)
    return { label: "Right here!", emoji: "🫂", gradient: "from-accent to-accent/60", iconGlow: "glow-mint-strong", progress };
  if (km < 1)
    return { label: "Very close", emoji: "🏃", gradient: "from-accent to-lavender/60", iconGlow: "glow-mint", progress };
  if (km < 10)
    return { label: "Nearby", emoji: "🚶", gradient: "from-lavender to-primary/60", iconGlow: "glow-lavender", progress };
  if (km < 50)
    return { label: "Same city", emoji: "🏙️", gradient: "from-amber to-primary/60", iconGlow: "glow-amber", progress };
  if (km < 200)
    return { label: "A drive away", emoji: "🚗", gradient: "from-amber/80 to-coral/60", iconGlow: "glow-amber", progress };
  if (km < 1000)
    return { label: "Far apart", emoji: "✈️", gradient: "from-primary to-lavender/60", iconGlow: "glow-rose", progress };
  return { label: "Long distance", emoji: "🌍", gradient: "from-primary to-coral/60", iconGlow: "glow-rose-strong", progress };
}

const DistanceBanner: React.FC<DistanceBannerProps> = ({ distance, partnerName, partnerMood }) => {
  const formatted = formatDistance(distance);
  const level = getDistanceLevel(distance);
  const [pulseKey, setPulseKey] = useState(0);
  const prevDistRef = useRef<number | null>(distance);
  const progressAnimatedRef = useRef(false);

  // Trigger pulse when distance updates; progress bar animates from previous to new value
  useEffect(() => {
    if (distance !== prevDistRef.current) {
      setPulseKey((k) => k + 1);
    }
    prevDistRef.current = distance;
  }, [distance]);

  return (
    <motion.div
      key={`banner-${pulseKey}`}
      className="glass-card-elevated relative overflow-hidden"
      initial={pulseKey === 0 ? { opacity: 0, y: 20 } : { scale: 1.03 }}
      animate={pulseKey === 0 ? { opacity: 1, y: 0 } : { scale: 1 }}
      transition={{ duration: pulseKey === 0 ? 0.5 : 0.4, ease: "easeOut" }}
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
              {level.emoji} {level.label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-heading font-extrabold text-foreground leading-none">
                {formatted}
              </span>
              <span className="text-xs font-body text-muted-foreground">away</span>
            </div>
            {/* Distance label description */}
            {distance !== null && (
              <p className="text-[11px] font-body text-muted-foreground/70 mt-1">
                {distance < 0.001
                  ? "Under 1 m"
                  : distance < 1
                    ? `${(distance * 1000).toFixed(1).replace(/\.0$/, "")} m between you & ${partnerName}`
                    : `${distance < 10 ? distance.toFixed(1) : Math.round(distance)} km between you & ${partnerName}`}
              </p>
            )}
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

        {/* Progress bar — width reflects actual distance (closeness); no reset on update */}
        {distance !== null && (
          <div className="mt-4">
            <div className="w-full h-1 rounded-full bg-secondary/40 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${level.gradient}`}
                initial={progressAnimatedRef.current ? false : { width: 0 }}
                animate={{ width: `${level.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onAnimationComplete={() => { progressAnimatedRef.current = true; }}
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
