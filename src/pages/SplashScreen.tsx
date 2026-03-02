import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViblyButton from "@/components/ViblyButton";

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 mesh-bg noise-overlay vignette relative overflow-hidden">
      {/* Animated orbit rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px]">
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-primary/40 blur-[2px]" />
        </motion.div>
        <motion.div
          className="absolute inset-6 rounded-full border border-lavender/8"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -bottom-1 right-1/4 w-1.5 h-1.5 rounded-full bg-lavender/40 blur-[1px]" />
        </motion.div>
        <motion.div
          className="absolute inset-12 rounded-full border border-accent/6"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Ambient rose glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, hsla(340,100%,61%,0.18) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary lavender ambient */}
      <motion.div
        className="absolute top-[30%] left-[65%] w-48 h-48 rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, hsla(263,86%,76%,0.1) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Sparkle particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() > 0.5 ? 2 : 1,
            height: Math.random() > 0.5 ? 2 : 1,
            background: i % 3 === 0 ? "hsl(var(--primary))" : i % 3 === 1 ? "hsl(var(--lavender))" : "hsl(var(--accent))",
            top: `${20 + Math.random() * 50}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
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
          animate={{ scale: [1, 1.06, 1], y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Outer glow halo */}
          <div className="absolute inset-0 -m-10 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div className="absolute inset-0 -m-5 rounded-full bg-primary/12 blur-xl animate-pulse-glow" />
          <span className="relative text-7xl block drop-shadow-[0_0_30px_hsla(340,100%,61%,0.4)]">❤️</span>
        </motion.div>

        {/* Logo */}
        <motion.h1
          className="font-heading font-extrabold text-[52px] text-gradient-rose-lavender text-glow-gradient mb-3"
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
