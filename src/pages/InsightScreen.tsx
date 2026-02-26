import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProgressBar from "@/components/ProgressBar";
import ViblyButton from "@/components/ViblyButton";

const InsightScreen: React.FC = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = 67;
    const duration = 1200;
    const step = duration / target;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setCount(current);
      if (current >= target) clearInterval(interval);
    }, step);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      <ProgressBar progress={30} step={4} totalSteps={12} />

      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
        {/* Ambient glow behind stat */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-[120px] pointer-events-none" style={{ background: "radial-gradient(circle, hsla(340,100%,61%,0.12) 0%, transparent 70%)" }} />

        <motion.div
          className="text-5xl mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          📊
        </motion.div>

        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="absolute inset-0 text-gradient-rose-lavender text-[60px] font-heading font-extrabold blur-xl opacity-40">
            {count}%
          </div>
          <span className="relative text-[60px] font-heading font-extrabold text-gradient-rose-lavender text-glow-rose">
            {count}%
          </span>
        </motion.div>

        <motion.p
          className="text-base font-body text-foreground max-w-[280px] leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Couples who check in daily are <strong>67%</strong> more likely to stay together.
        </motion.p>
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <ViblyButton onClick={() => navigate("/social-proof")}>
          Continue →
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default InsightScreen;