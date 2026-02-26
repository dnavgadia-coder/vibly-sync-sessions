import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number; // 0-100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full h-[3px] bg-secondary/60 rounded-pill overflow-hidden mb-2">
      <motion.div
        className="h-full rounded-pill shimmer"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
};

export default ProgressBar;
