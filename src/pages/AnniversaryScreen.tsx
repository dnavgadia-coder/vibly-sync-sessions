import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ViblyButton from "@/components/ViblyButton";

const AnniversaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");

  const handleContinue = async () => {
    if (!date) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ start_date: date }).eq("id", user.id);
    }
    navigate("/loading");
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-full flex flex-col px-6 pt-14 pb-8 mesh-bg noise-overlay vignette overflow-x-hidden box-border">
      <div className="flex-1 flex flex-col justify-center relative z-10 min-w-0 w-full box-border">
        <div className="w-full min-w-0 flex flex-col items-stretch box-border overflow-hidden px-1">
          <motion.div
            className="text-5xl mb-6 text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            💛
          </motion.div>

          <motion.h2
            className="font-heading font-bold text-[28px] text-foreground text-center mb-3 leading-tight"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          >
            When did it all start?
          </motion.h2>

          <motion.p
            className="text-sm font-body text-muted-foreground text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            We'll count every day together 💛
          </motion.p>

          <motion.div
            className="w-full min-w-0 overflow-hidden box-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="block w-full glass-card px-4 py-4 rounded-[14px] text-foreground font-body text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-all border border-border box-border"
              style={{ colorScheme: "dark", maxWidth: "100%", minWidth: 0, width: "100%", boxSizing: "border-box" }}
            />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="relative z-10 w-full min-w-0 box-border overflow-hidden px-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ViblyButton onClick={handleContinue} disabled={!date}>
          Continue →
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default AnniversaryScreen;
