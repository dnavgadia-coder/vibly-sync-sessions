import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const steps = [
  "Analyzing your answers...",
  "Building your vibe profile...",
  "Finding your match patterns...",
  "Almost ready...",
];

const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => navigate("/connect"), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [navigate]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 mesh-bg noise-overlay vignette">
      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsla(340,100%,61%,0.1) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[280px]">
        {/* Spinner */}
        <motion.div
          className="w-16 h-16 rounded-full border-2 border-white/[0.06] border-t-primary mb-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/[0.04] rounded-pill overflow-hidden mb-6">
          <motion.div
            className="h-full rounded-pill bg-gradient-rose"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Step text */}
        <motion.p
          key={currentStep}
          className="text-sm font-body text-muted-foreground text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          {steps[currentStep]}
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;