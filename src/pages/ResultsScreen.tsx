import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViblyButton from "@/components/ViblyButton";
import { Lock } from "lucide-react";

const vibeStats = [
  { label: "Communication", value: 78, color: "bg-primary", glowClass: "glow-pink", locked: false },
  { label: "Trust", value: 85, color: "bg-purple", glowClass: "glow-purple", locked: true },
  { label: "Fun", value: 92, color: "bg-accent", glowClass: "glow-green", locked: true },
  { label: "Depth", value: 64, color: "bg-amber", glowClass: "glow-amber", locked: true },
];

const ResultsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8 bg-background grain-overlay vignette">
      <div className="flex-1 flex flex-col justify-center relative z-10">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-primary/8 blur-[80px] pointer-events-none" />

        <motion.h2
          className="font-heading font-bold text-[26px] text-foreground text-center mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Vibe Profile is ready
        </motion.h2>

        <motion.div
          className="card-cinematic rounded-card p-6 border border-border mb-5 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
          {/* Edge glow */}
          <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="flex flex-col gap-6">
            {vibeStats.map((stat, index) => (
              <div key={stat.label} className="relative">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm font-body text-foreground font-medium">{stat.label}</span>
                  <span className="text-sm font-heading font-bold text-foreground">
                    {stat.locked ? "" : `${stat.value}%`}
                    {stat.locked && <Lock className="w-3 h-3 inline text-muted-foreground" />}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-secondary/60 rounded-pill overflow-hidden relative">
                  {stat.locked && (
                    <div className="absolute inset-0 frosted-strong bg-secondary/40 z-10" />
                  )}
                  <motion.div
                    className={`h-full rounded-pill ${stat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ delay: 0.4 + index * 0.15, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          className="text-[13px] font-body text-muted-foreground text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          🔒 Invite Sarah to unlock full results
        </motion.p>
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <ViblyButton onClick={() => navigate("/paywall")}>
          See Full Results →
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default ResultsScreen;
