import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProgressBar from "@/components/ProgressBar";
import ViblyButton from "@/components/ViblyButton";
import { Lock } from "lucide-react";

const FeatureLockScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8 bg-background grain-overlay">
      <ProgressBar progress={55} />

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          className="text-6xl mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          🔒
        </motion.div>

        <motion.h2
          className="font-heading font-bold text-[22px] text-foreground mb-6 max-w-[300px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          One question. Two answers. Zero hiding.
        </motion.h2>

        {/* Question card */}
        <motion.div
          className="w-full bg-card border border-border rounded-card p-4 mb-3 card-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-body font-semibold text-foreground">
            Who dies first in a horror movie?
          </p>
        </motion.div>

        {/* Answer cards */}
        <div className="w-full grid grid-cols-2 gap-2 mb-6">
          <motion.div
            className="bg-card border-[1.5px] border-primary rounded-option p-3 text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm font-body text-foreground font-medium">Me 💀</p>
          </motion.div>

          <motion.div
            className="relative bg-card border border-border rounded-option p-3 text-left overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Frosted blur */}
            <div className="absolute inset-0 bg-card/80 frosted flex items-center justify-center z-10">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-body text-foreground font-medium">Partner's answer</p>
          </motion.div>
        </div>

        <motion.p
          className="text-sm font-body text-muted-foreground max-w-[280px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Answer daily questions, then see if you match.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <ViblyButton onClick={() => navigate("/results")}>
          Continue →
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default FeatureLockScreen;
