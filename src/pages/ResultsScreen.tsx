import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViblyButton from "@/components/ViblyButton";
import { Lock } from "lucide-react";

import { useProfile } from "@/hooks/useProfile";

const vibeStats = [
  { label: "Communication", value: 78, color: "bg-primary", locked: false },
  { label: "Trust", value: 85, color: "bg-lavender", locked: true },
  { label: "Fun", value: 92, color: "bg-accent", locked: true },
  { label: "Depth", value: 64, color: "bg-amber", locked: true },
];

const ResultsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const partnerName = profile?.partner_name || "Partner";

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <motion.h2
          className="font-heading font-bold text-[26px] text-foreground text-center mb-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.34, 1.56, 0.64, 1] }}
        >
          Your Vibe Profile is ready
        </motion.h2>

        <motion.div
          className="glass-card-elevated p-6 mb-5 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
          {/* Top edge glow */}
          <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          <div className="flex flex-col gap-6">
            {vibeStats.map((stat, index) => (
              <div key={stat.label} className="relative">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm font-body text-foreground font-medium">{stat.label}</span>
                  <span className="text-sm font-heading font-bold text-foreground">
                    <span style={stat.locked ? { filter: "blur(4px)" } : {}}>
                      {stat.value}%
                    </span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/[0.04] rounded-pill overflow-hidden relative">
                  {/* Blur effect on locked bars */}
                  <motion.div
                    className={`h-full rounded-pill ${stat.color}`}
                    style={stat.locked ? { filter: "blur(4px)" } : {}}
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
          🔒 Invite {partnerName} to unlock full results
        </motion.p>
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <ViblyButton onClick={() => navigate("/paywall", { state: { from: "onboarding" } })}>
          See Full Results →
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default ResultsScreen;