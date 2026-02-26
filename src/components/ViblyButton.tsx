import React from "react";
import { motion } from "framer-motion";

interface ViblyButtonProps {
  children: React.ReactNode;
  variant?: "pink" | "green";
  onClick?: () => void;
  className?: string;
}

const ViblyButton: React.FC<ViblyButtonProps> = ({ children, variant = "pink", onClick, className = "" }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        w-full py-4 rounded-pill font-heading font-bold text-base tracking-wide relative overflow-hidden
        ${variant === "pink"
          ? "bg-gradient-pink text-primary-foreground glow-pink-strong"
          : "bg-gradient-green text-accent-foreground glow-green-strong"
        }
        ${className}
      `}
    >
      {/* Subtle shine layer */}
      <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <span className="relative z-[1]">{children}</span>
    </motion.button>
  );
};

export default ViblyButton;
