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
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8 bg-background grain-overlay">
      <ProgressBar progress={45} />

      <div className="flex-1 flex flex-col justify-center">
        <motion.h2
          className="font-heading font-bold text-2xl text-foreground text-center mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Join 200,000+ couples
        </motion.h2>

        <div className="flex flex-col gap-2">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              className="bg-card border border-border rounded-option p-4 card-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.1 }}
            >
              <div className="text-amber text-sm mb-2">⭐⭐⭐⭐⭐</div>
              <p className="text-sm font-body text-foreground mb-1">"{review.quote}"</p>
              <p className="text-xs font-body text-muted-foreground">— {review.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
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
