import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProgressBar from "@/components/ProgressBar";
import ViblyButton from "@/components/ViblyButton";

const reviews = [
  { quote: "We actually talk about real stuff now", name: "Emma, 26" },
  { quote: "The distance tracker is everything for LDR", name: "Marcus, 29" },
  { quote: "Better than couples therapy tbh", name: "Aisha, 24" },
];

const SocialProofScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8 bg-background grain-overlay vignette">
      <ProgressBar progress={45} />

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <motion.h2
          className="font-heading font-bold text-[26px] text-foreground text-center mb-10"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Join 200,000+ couples
        </motion.h2>

        <div className="flex flex-col gap-3">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              className="card-cinematic border border-border rounded-option p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.1 }}
            >
              <div className="text-amber text-sm mb-2.5 text-glow-amber">⭐⭐⭐⭐⭐</div>
              <p className="text-[15px] font-body text-foreground mb-1.5 leading-relaxed">"{review.quote}"</p>
              <p className="text-xs font-body text-muted-foreground">— {review.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <ViblyButton onClick={() => navigate("/feature-distance")}>
          Continue →
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default SocialProofScreen;
