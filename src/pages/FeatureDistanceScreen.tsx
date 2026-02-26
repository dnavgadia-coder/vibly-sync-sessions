import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProgressBar from "@/components/ProgressBar";
import ViblyButton from "@/components/ViblyButton";

const FeatureDistanceScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      <ProgressBar progress={50} step={7} totalSteps={12} />

      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
        {/* Ambient lavender glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-48 rounded-full blur-[100px] pointer-events-none" style={{ background: "radial-gradient(circle, hsla(263,86%,76%,0.08) 0%, transparent 70%)" }} />

        <motion.div
          className="text-6xl mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          📍
        </motion.div>

        <motion.h2
          className="font-heading font-bold text-[24px] text-foreground mb-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        >
          Track your distance apart
        </motion.h2>

        {/* Demo Card */}
        <motion.div
          className="w-full glass-card-elevated p-6 mb-8 light-sweep"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4 text-lg">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-sm">📍</span>
            </div>
            <span className="text-muted-foreground tracking-[6px] text-sm">• • • • • • •</span>
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-sm">📍</span>
            </div>
          </div>
          <motion.p
            className="text-[24px] font-heading font-bold text-amber text-glow-amber"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            847 km
          </motion.p>
        </motion.div>

        <motion.p
          className="text-sm font-body text-muted-foreground max-w-[280px] leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          See exactly how far you are. Watch it shrink as you get closer.
        </motion.p>
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <ViblyButton onClick={() => navigate("/feature-lock")}>
          Continue →
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default FeatureDistanceScreen;