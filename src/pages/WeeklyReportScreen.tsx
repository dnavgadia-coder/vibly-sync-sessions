import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViblyButton from "@/components/ViblyButton";

const WeeklyReportScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center px-5 pt-14 pb-8 bg-background grain-overlay vignette">
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full bg-primary/8 blur-[80px] pointer-events-none" />

        <motion.div
          className="w-full card-cinematic rounded-[22px] p-7 border border-border relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          {/* Top edge glow */}
          <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-1">
            WEEK 6 SYNC REPORT
          </p>
          <h2 className="font-heading font-bold text-[22px] text-foreground mb-6">
            Denis & Sarah
          </h2>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { emoji: "🔥", value: "14", color: "text-accent text-glow-green" },
              { emoji: "💕", value: "78%", color: "text-primary text-glow-pink" },
              { emoji: "✅", value: "7/7", color: "text-purple" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="bg-secondary/30 rounded-option p-4 text-center inner-shadow"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <p className="text-lg mb-1">{stat.emoji}</p>
                <p className={`text-[28px] font-heading font-black tracking-tight ${stat.color}`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Best Match */}
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className="inline-block bg-accent/15 text-accent text-xs font-heading font-bold px-3 py-1 rounded-pill mb-2 glow-green">
              BEST MATCH ✨
            </span>
            <p className="text-[15px] font-body text-foreground leading-relaxed">
              100% match — you both said the road trip 🥹
            </p>
          </motion.div>

          {/* Biggest Miss */}
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <span className="inline-block bg-primary/15 text-primary text-xs font-heading font-bold px-3 py-1 rounded-pill mb-2 glow-pink">
              BIGGEST MISS 😂
            </span>
            <p className="text-[15px] font-body text-foreground leading-relaxed">
              You both said the other one 💀
            </p>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-[11px] font-body text-muted-foreground text-center mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            made with Vibly 💕
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="w-full mt-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <ViblyButton variant="green" onClick={() => navigate("/home")}>
          Share to Stories →
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default WeeklyReportScreen;
