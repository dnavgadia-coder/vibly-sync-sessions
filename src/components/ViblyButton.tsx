import React from "react";
import { motion } from "framer-motion";

interface ViblyButtonProps {
  children: React.ReactNode;
  variant?: "rose" | "mint";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const ViblyButton: React.FC<ViblyButtonProps> = ({ children, variant = "rose", onClick, className = "", disabled = false }) => {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        w-full py-4 rounded-pill font-heading font-bold text-base tracking-wide relative overflow-hidden
        ${variant === "rose"
          ? "bg-gradient-rose text-primary-foreground glow-rose-strong"
          : "bg-gradient-mint text-accent-foreground glow-mint-strong"
        }
        ${className}
      `}
    >
      {/* Top shine */}
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {/* Subtle shine layer */}
      <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <span className="relative z-[1]">{children}</span>
    </motion.button>
  );
};

export default ViblyButton;