import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
    setTimeout(() => navigate("/insight"), 600);
  };

  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8 bg-background grain-overlay">
      <ProgressBar progress={15} />

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.h2
            key="question"
            className="font-heading font-bold text-[26px] text-foreground mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            What's your situation?
          </motion.h2>
        </AnimatePresence>

        <div className="flex flex-col gap-2">
          {options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
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
