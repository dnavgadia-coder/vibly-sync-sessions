import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViblyButton from "@/components/ViblyButton";

const WeeklyReportScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center px-5 pt-14 pb-8 bg-background grain-overlay">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div
          className="w-full bg-gradient-to-b from-card-elevated to-card rounded-[22px] p-6 border border-border card-shadow"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-1">
            WEEK 6 SYNC REPORT
          </p>
          <h2 className="font-heading font-bold text-xl text-foreground mb-5">
            Denis & Sarah
          </h2>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { emoji: "🔥", value: "14", color: "text-accent" },
              { emoji: "💕", value: "78%", color: "text-primary" },
              { emoji: "✅", value: "7/7", color: "text-purple" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="bg-secondary/50 rounded-option p-3 text-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <p className="text-lg mb-1">{stat.emoji}</p>
                <p className={`text-[28px] font-heading font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Best Match */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className="inline-block bg-accent/15 text-accent text-xs font-heading font-bold px-3 py-1 rounded-pill mb-2">
              BEST MATCH ✨
            </span>
            <p className="text-sm font-body text-foreground">
              100% match — you both said the road trip 🥹
            </p>
          </motion.div>

          {/* Biggest Miss */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <span className="inline-block bg-primary/15 text-primary text-xs font-heading font-bold px-3 py-1 rounded-pill mb-2">
              BIGGEST MISS 😂
            </span>
            <p className="text-sm font-body text-foreground">
              You both said the other one 💀
            </p>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-[11px] font-body text-muted-foreground text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            made with Vibly 💕
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="w-full mt-6"
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
