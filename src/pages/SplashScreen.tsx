import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViblyButton from "@/components/ViblyButton";

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-background grain-overlay vignette relative overflow-hidden">
      {/* Ambient pink glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/15 blur-[100px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary purple ambient */}
      <motion.div
        className="absolute top-[40%] left-[60%] w-40 h-40 rounded-full bg-purple/10 blur-[80px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Heart with halo */}
        <motion.div
          className="relative text-6xl mb-8"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Halo ring */}
          <div className="absolute inset-0 -m-4 rounded-full bg-primary/10 blur-xl animate-pulse-glow" />
          <span className="relative">💕</span>
        </motion.div>

        {/* Logo */}
        <motion.h1
          className="font-heading font-black text-[46px] text-foreground tracking-tight mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Vibly
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-[15px] font-body font-medium text-muted-foreground text-center max-w-[280px] mb-14 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          How well do you ACTUALLY know each other?
        </motion.p>
      </div>

      {/* CTA */}
      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <ViblyButton onClick={() => navigate("/quiz")}>
          Let's find out →
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
