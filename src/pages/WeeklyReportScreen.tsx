import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWeeklyReport } from "@/hooks/useWeeklyReport";
import ViblyButton from "@/components/ViblyButton";

const WeeklyReportScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    streak, matchPercent, answeredCount,
    bestMatch, biggestMiss,
    userName, partnerName, loading,
  } = useWeeklyReport();

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center mesh-bg noise-overlay vignette">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <span className="text-3xl">💕</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        <motion.div
          className="w-full glass-card-elevated p-7 relative overflow-hidden light-sweep"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-1">
            SYNC REPORT
          </p>
          <h2 className="font-heading font-bold text-[22px] text-foreground mb-6">
            {userName} & {partnerName}
          </h2>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { emoji: "🔥", value: String(streak), label: "Streak", color: "text-accent text-glow-mint" },
              { emoji: "💕", value: `${matchPercent}%`, label: "Match", color: "text-primary text-glow-rose" },
              { emoji: "✅", value: answeredCount, label: "Done", color: "text-lavender" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="glass-card p-4 text-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <p className="text-lg mb-1">{stat.emoji}</p>
                <p className={`text-[28px] font-heading font-extrabold tracking-tight ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-[9px] font-body text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Best Match */}
          {bestMatch ? (
            <motion.div
              className="mb-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="inline-block bg-accent/12 text-accent text-xs font-heading font-bold px-3 py-1 rounded-pill mb-2 glow-mint">
                BEST MATCH ✨
              </span>
              <p className="text-[15px] font-body text-foreground leading-relaxed">
                {bestMatch.text} {bestMatch.emoji}
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="mb-5 text-center py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm font-body text-muted-foreground">Answer more questions together to see matches!</p>
            </motion.div>
          )}

          {/* Biggest Miss */}
          {biggestMiss && (
            <motion.div
              className="mb-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <span className="inline-block bg-primary/12 text-primary text-xs font-heading font-bold px-3 py-1 rounded-pill mb-2 glow-rose">
                BIGGEST MISS 😂
              </span>
              <p className="text-[15px] font-body text-foreground leading-relaxed">
                You said "{biggestMiss.myAnswer}" but {partnerName} said "{biggestMiss.partnerAnswer}" 💀
              </p>
            </motion.div>
          )}

          <motion.p
            className="text-[11px] font-body text-muted-foreground text-center mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            made with Vibly 💕
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="w-full mt-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <ViblyButton variant="mint" onClick={() => navigate("/home")}>
          ← Back to Home
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default WeeklyReportScreen;
