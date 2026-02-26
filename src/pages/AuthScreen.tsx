import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ViblyButton from "@/components/ViblyButton";
import { toast } from "sonner";

const AuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/home");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to verify your account!");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      {/* Ambient glow */}
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
          {isLogin ? "👋" : "💕"}
        </motion.div>

        <motion.h2
          className="font-heading font-bold text-[28px] text-foreground text-center mb-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {isLogin ? "Welcome back" : "Create your account"}
        </motion.h2>

        <motion.p
          className="text-sm font-body text-muted-foreground text-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isLogin ? "Sign in to continue" : "Start your love journey"}
        </motion.p>

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full glass-card px-5 py-4 rounded-option text-foreground font-body text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-all"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full glass-card px-5 py-4 rounded-option text-foreground font-body text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-all"
          />
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 flex flex-col gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ViblyButton onClick={handleAuth}>
          {loading ? "..." : isLogin ? "Sign in →" : "Create account →"}
        </ViblyButton>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm font-body text-muted-foreground text-center py-2"
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="text-primary font-semibold">
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </button>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
