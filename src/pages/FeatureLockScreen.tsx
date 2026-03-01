import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProgressBar from "@/components/ProgressBar";
import ViblyButton from "@/components/ViblyButton";
import { Lock } from "lucide-react";
import { useDeviceAuth } from "@/hooks/useDeviceAuth";

const FeatureLockScreen: React.FC = () => {
  const navigate = useNavigate();
  const { ensureDeviceAccount } = useDeviceAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleContinue = async () => {
    setSigningIn(true);
    const ok = await ensureDeviceAccount();
    setSigningIn(false);
    if (ok) {
      navigate("/name");
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      <ProgressBar progress={55} step={8} totalSteps={12} />

      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
        <motion.div
          className="text-6xl mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          🔒
        </motion.div>

        <motion.h2
          className="font-heading font-bold text-[22px] text-foreground mb-8 max-w-[300px] leading-tight"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        >
          One question. Two answers. Zero hiding.
        </motion.h2>

        {/* Question card */}
        <motion.div
          className="w-full glass-card-elevated p-5 mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-body font-semibold text-foreground text-[15px]">
            Who dies first in a horror movie?
          </p>
        </motion.div>

        {/* Answer cards */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-8">
          <motion.div
            className="glass-card border-primary bg-primary/[0.08] p-4 text-left glow-rose"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm font-body text-foreground font-medium">Me 💀</p>
          </motion.div>

          <motion.div
            className="relative glass-card p-4 text-left overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-card/60 frosted-strong flex items-center justify-center z-10">
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm font-body text-foreground font-medium">Partner's answer</p>
          </motion.div>
        </div>

        <motion.p
          className="text-sm font-body text-muted-foreground max-w-[280px] leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Answer daily questions, then see if you match.
        </motion.p>
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <ViblyButton onClick={handleContinue} disabled={signingIn}>
          {signingIn ? "Setting up..." : "Continue →"}
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default FeatureLockScreen;