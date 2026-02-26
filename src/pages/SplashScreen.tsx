import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViblyButton from "@/components/ViblyButton";

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 mesh-bg noise-overlay vignette relative overflow-hidden">
      {/* Ambient rose glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, hsla(340,100%,61%,0.2) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary lavender ambient */}
      <motion.div
        className="absolute top-[30%] left-[65%] w-48 h-48 rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, hsla(263,86%,76%,0.1) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Sparkle particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/60"
          style={{
            top: `${25 + Math.random() * 40}%`,
            left: `${15 + Math.random() * 70}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center">
        {/* 3D Heart with halo */}
        <motion.div
          className="relative mb-10"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Outer glow halo */}
          <div className="absolute inset-0 -m-8 rounded-full bg-primary/10 blur-2xl animate-pulse-glow" />
          <div className="absolute inset-0 -m-4 rounded-full bg-primary/15 blur-xl animate-pulse-glow" />
          <span className="relative text-7xl block">❤️</span>
        </motion.div>

        {/* Logo */}
        <motion.h1
          className="font-heading font-extrabold text-[48px] text-foreground mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          Vibly
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-[15px] font-body font-medium text-muted-foreground text-center max-w-[260px] mb-16 leading-relaxed"
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