import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProgressBar from "@/components/ProgressBar";

const steps = [
  "✨ Analyzing your connection style...",
  "💕 Preparing your first questions...",
  "🎯 Calibrating your Vibe Score...",
];

const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar from 0 to 100 over 3 seconds
    const start = Date.now();
    const duration = 3000;
    const frame = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (elapsed < duration) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    // Auto advance after 3 seconds
    const timeout = setTimeout(() => navigate("/results"), 3200);
    return () => clearTimeout(timeout);
  }, [navigate]);

  // Step text transitions
  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setCurrentStep(i), i * 800)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      <ProgressBar progress={70} step={10} totalSteps={12} />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Ambient glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, hsla(340,100%,61%,0.1) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <motion.h2
          className="font-heading font-bold text-[20px] text-foreground text-center mb-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Building your Vibe Profile...
        </motion.h2>

        {/* Progress bar */}
        <div className="w-full max-w-[280px] h-1.5 bg-white/[0.05] rounded-pill overflow-hidden mb-8">
          <motion.div
            className="h-full rounded-pill"
            style={{ background: "linear-gradient(90deg, hsl(340, 100%, 61%), hsl(263, 86%, 76%))" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Step text */}
        <div className="flex flex-col gap-3 items-center">
          {steps.map((step, i) => (
            <motion.p
              key={i}
              className="text-sm font-body text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: i <= currentStep ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              {step}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
