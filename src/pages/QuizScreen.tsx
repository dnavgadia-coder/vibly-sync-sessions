import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import OptionCard from "@/components/OptionCard";

const QuizScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);

  const options = [
    { emoji: "💑", text: "In a relationship" },
    { emoji: "🤷", text: "It's complicated" },
    { emoji: "💬", text: "Talking stage" },
    { emoji: "💍", text: "Married" },
  ];

  const handleSelect = (index: number) => {
    setSelected(index);
    setTimeout(() => navigate("/insight"), 400);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      {/* Back + Step */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06]">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-[13px] font-body text-muted-foreground">Step 2 of 12</span>
      </div>

      <ProgressBar progress={15} step={2} totalSteps={12} />

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.h2
            key="question"
            className="font-heading font-bold text-[28px] text-foreground mb-10 leading-tight"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            What's your situation?
          </motion.h2>
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          {options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <OptionCard
                emoji={option.emoji}
                text={option.text}
                selected={selected === index}
                onClick={() => handleSelect(index)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;