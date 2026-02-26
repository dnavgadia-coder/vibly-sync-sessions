import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ViblyButton from "@/components/ViblyButton";
import { toast } from "sonner";
import { Copy, Link, Share2 } from "lucide-react";

const ConnectPartnerScreen: React.FC = () => {
  const navigate = useNavigate();
  const [myCode, setMyCode] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundPartner, setFoundPartner] = useState<{ id: string; name: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    const fetchMyCode = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("invite_code, partner_id")
        .eq("id", user.id)
        .single();
      if (data?.partner_id) {
        navigate("/home");
        return;
      }
      if (data?.invite_code) setMyCode(data.invite_code);
    };
    fetchMyCode();
  }, [navigate]);

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    toast.success("Code copied!");
  };

  const searchPartner = async () => {
    if (partnerCode.trim().length < 4) {
      toast.error("Enter a valid code");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("find_user_by_invite_code", {
        _code: partnerCode.trim(),
      });
      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error("No match found. Check the code.");
        return;
      }
      setFoundPartner(data[0]);
      setShowConfirm(true);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confirmLink = async () => {
    if (!foundPartner) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc("link_partners", {
        _partner_id: foundPartner.id,
      });
      if (error) throw error;
      setLinked(true);
      setTimeout(() => navigate("/home"), 2500);
    } catch (err: any) {
      toast.error(err.message || "Linking failed");
    } finally {
      setLoading(false);
    }
  };

  // Celebration screen
  if (linked) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 mesh-bg noise-overlay vignette">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{ left: `${5 + Math.random() * 90}%`, top: `${5 + Math.random() * 90}%` }}
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -80] }}
              transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.8, repeat: Infinity }}
            >
              {["💕", "✨", "🌹", "💖"][Math.floor(Math.random() * 4)]}
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="relative z-10 text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <span className="text-7xl block mb-6">💑</span>
          <h2 className="font-heading font-bold text-[32px] text-foreground mb-3">You're connected!</h2>
          <p className="font-body text-muted-foreground">
            Your journey together starts now
          </p>
        </motion.div>
      </div>
    );
  }

  // Confirmation dialog
  if (showConfirm && foundPartner) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 mesh-bg noise-overlay vignette">
        <motion.div
          className="relative z-10 glass-card-elevated p-8 w-full max-w-sm text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          <span className="text-5xl block mb-5">🤝</span>
          <h3 className="font-heading font-bold text-[22px] text-foreground mb-3">
            Connect with {foundPartner.name || "this person"}?
          </h3>
          <p className="text-sm font-body text-muted-foreground mb-8 leading-relaxed">
            Your answers, moods, and distance will be shared with each other.
          </p>
          <div className="flex flex-col gap-3">
            <ViblyButton onClick={confirmLink}>
              {loading ? "Connecting..." : "Confirm ✨"}
            </ViblyButton>
            <button
              onClick={() => { setShowConfirm(false); setFoundPartner(null); }}
              className="py-3 text-sm font-body text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      <div className="flex-1 flex flex-col relative z-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-5xl block mb-4">💌</span>
          <h2 className="font-heading font-bold text-[28px] text-foreground mb-2">
            Connect with partner
          </h2>
          <p className="text-sm font-body text-muted-foreground">
            Share your code or enter theirs
          </p>
        </motion.div>

        {/* My invite code */}
        <motion.div
          className="glass-card-elevated p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-3">
            YOUR INVITE CODE
          </p>
          <div className="flex items-center justify-between">
            <p className="font-heading font-extrabold text-[36px] text-foreground tracking-[0.15em]">
              {myCode || "------"}
            </p>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyCode}
              className="w-11 h-11 rounded-full bg-primary/12 flex items-center justify-center glow-rose"
            >
              <Copy className="w-5 h-5 text-primary" />
            </motion.button>
          </div>
          <p className="text-xs font-body text-muted-foreground mt-3">Expires in 24 hours</p>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs font-body text-muted-foreground">or enter partner's code</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Partner code input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="text"
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
            placeholder="Enter code (e.g. EX4145)"
            maxLength={6}
            className="w-full glass-card px-5 py-4 rounded-option text-foreground font-heading font-bold text-xl text-center tracking-[0.15em] placeholder:text-muted-foreground placeholder:text-base placeholder:font-body placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-primary/30 transition-all uppercase"
          />
        </motion.div>
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ViblyButton onClick={searchPartner}>
          {loading ? "Searching..." : "Find partner →"}
        </ViblyButton>
        <button
          onClick={() => navigate("/home")}
          className="w-full py-3 mt-3 text-sm font-body text-muted-foreground text-center"
        >
          Skip for now
        </button>
      </motion.div>
    </div>
  );
};

export default ConnectPartnerScreen;
