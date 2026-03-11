import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  step?: number;
  totalSteps?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, step, totalSteps }) => {
  return (
    <div className="flex items-center gap-3 mb-4 relative z-10">
      <div className="flex-1 h-[3px] bg-white/[0.08] rounded-pill overflow-hidden">
        <motion.div
          className="h-full rounded-pill shimmer"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {step != null && totalSteps != null && (
        <span className="text-[13px] font-body text-foreground/60 tabular-nums shrink-0">
          {step}/{totalSteps}
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
