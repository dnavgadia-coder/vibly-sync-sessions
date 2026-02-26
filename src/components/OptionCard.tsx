import React from "react";
import { motion } from "framer-motion";

interface OptionCardProps {
  emoji: string;
  text: string;
  selected?: boolean;
  onClick?: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ emoji, text, selected = false, onClick }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3.5 rounded-option text-left transition-all duration-200
        ${selected
          ? "border-[1.5px] border-primary bg-primary/[0.08] glow-pink"
          : "border-[1.5px] border-border bg-card"
        }
      `}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-[15px] font-body font-medium text-foreground">{text}</span>
    </motion.button>
  );
};

export default OptionCard;
