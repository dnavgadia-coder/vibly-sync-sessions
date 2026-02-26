import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProgressBar from "@/components/ProgressBar";
import ViblyButton from "@/components/ViblyButton";

const FeatureDistanceScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8 bg-background grain-overlay">
      <ProgressBar progress={50} />

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          className="text-6xl mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          📍
        </motion.div>

        <motion.h2
          className="font-heading font-bold text-[22px] text-foreground mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Track your distance apart
        </motion.h2>

        {/* Demo Card */}
        <motion.div
          className="w-full bg-card border border-border rounded-card p-5 card-shadow mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-1 mb-3 text-lg">
            <span>📍</span>
            <span className="text-muted-foreground tracking-[4px]">•••••••</span>
            <span>📍</span>
          </div>
          <motion.p
            className="text-[22px] font-heading font-bold text-amber glow-amber"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            847 km
          </motion.p>
        </motion.div>

        <motion.p
          className="text-sm font-body text-muted-foreground max-w-[280px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          See exactly how far you are. Watch it shrink as you get closer.
        </motion.p>
      </div>

      <motion.div
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
