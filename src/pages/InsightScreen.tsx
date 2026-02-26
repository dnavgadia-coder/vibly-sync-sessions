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
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8 bg-background grain-overlay">
      <ProgressBar progress={30} />

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          className="text-5xl mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          📊
        </motion.div>

        <motion.div
          className="relative mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Glow behind number */}
          <div className="absolute inset-0 text-gradient-pink-purple text-[48px] font-heading font-black blur-xl opacity-50">
            {count}%
          </div>
          <span className="relative text-[48px] font-heading font-black text-gradient-pink-purple">
            {count}%
          </span>
        </motion.div>

        <motion.p
          className="text-base font-body text-foreground max-w-[280px] leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Couples who check in daily are 67% more likely to stay together.
        </motion.p>
      </div>

      <motion.div
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
