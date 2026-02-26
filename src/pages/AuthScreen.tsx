import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ViblyButton from "@/components/ViblyButton";
import { toast } from "sonner";

const FALLBACK_PWD = "vibly_mvp_2026!";

const AuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      // Try sign in first
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password: FALLBACK_PWD,
      });

      if (!signInErr) {
        navigate("/home");
        return;
      }

      // If invalid credentials, try sign up
      const { error: signUpErr } = await supabase.auth.signUp({
        email: trimmed,
        password: FALLBACK_PWD,
      });

      if (signUpErr) throw signUpErr;
      navigate("/name");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsla(340,100%,61%,0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <motion.div
          className="text-5xl mb-6 text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          💕
        </motion.div>

        <motion.h2
          className="font-heading font-bold text-[28px] text-foreground text-center mb-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          Welcome to Vibly
        </motion.h2>

        <motion.p
          className="text-sm font-body text-muted-foreground text-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Enter your email to get started
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            placeholder="Your email address"
            className="w-full glass-card px-5 py-4 rounded-option text-foreground font-body text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-all"
            autoFocus
          />
        </motion.div>
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ViblyButton onClick={handleContinue}>
          {loading ? "..." : "Continue →"}
        </ViblyButton>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
