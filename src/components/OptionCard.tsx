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
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3.5 px-5 py-4 rounded-option text-left transition-all duration-200 relative overflow-hidden
        ${selected
          ? "border border-primary/40 bg-primary/[0.08] glow-rose"
          : "glass-card-futuristic hover:border-white/10"
        }
      `}
    >
      {/* Subtle gradient border on hover */}
      {!selected && (
        <div className="absolute inset-0 rounded-option opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: "linear-gradient(135deg, hsla(340,100%,61%,0.05), transparent)" }}
        />
      )}
      <span className="text-xl relative z-[1]">{emoji}</span>
      <span className="text-[15px] font-body font-medium text-foreground flex-1 relative z-[1]">{text}</span>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-5 h-5 rounded-full bg-primary flex items-center justify-center relative z-[1]"
        >
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
};

export default OptionCard;
