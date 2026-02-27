import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy } from "lucide-react";

const ConnectPartnerScreen: React.FC = () => {
  const navigate = useNavigate();
  const [myCode, setMyCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundPartner, setFoundPartner] = useState<{ id: string; name: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [linked, setLinked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchMyCode = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("invite_code, invite_code_expires_at, partner_id")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.partner_id) {
        navigate("/home");
        return;
      }
      if (data?.invite_code) setMyCode(data.invite_code);
      if (data?.invite_code_expires_at) setExpiresAt(new Date(data.invite_code_expires_at));
    };
    fetchMyCode();
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, expiresAt.getTime() - now.getTime());
      if (diff === 0) { setCountdown("Expired"); return; }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      if (hours > 0) setCountdown(`${hours}h ${mins}m remaining`);
      else setCountdown(`${mins}:${secs.toString().padStart(2, "0")} remaining`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
      setTimeout(() => navigate("/notification"), 2500);
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
        <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
          <h2 className="font-heading font-bold text-[32px] text-foreground mb-3">Connected! 🎉</h2>
          <p className="font-body text-muted-foreground">Your journey together starts now</p>
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
            All your details, including answers and journal entries will be shared with your partner.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={confirmLink}
              className="w-full py-4 rounded-[20px] text-white font-heading font-bold text-base"
              style={{
                background: "linear-gradient(135deg, #FF3B7A, #FF6B9D)",
                boxShadow: "0 4px 24px rgba(255, 59, 122, 0.3)",
              }}
            >
              {loading ? "Connecting..." : "Confirm ✨"}
            </button>
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
    <div
      className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 relative"
      style={{ background: "linear-gradient(180deg, #FFE8D6 0%, #FFF5EE 50%, #FAFAFA 100%)" }}
    >
      {/* Not now */}
      <button
        onClick={() => navigate("/notification")}
        className="absolute top-4 right-5 z-10 text-[13px] font-body font-medium"
        style={{ color: "#666" }}
      >
        Not now
      </button>

      <div className="flex-1 flex flex-col relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2
            className="font-heading font-extrabold text-[28px] mb-2"
            style={{ color: "#1A1A2E" }}
          >
            Connect with Your Partner
          </h2>
          <p className="text-sm font-body" style={{ color: "#555" }}>
            All your details, including answers and journal entries will be shared with your partner.
          </p>
        </motion.div>

        {/* Send Code Card */}
        <motion.div
          className="rounded-[20px] p-5 mb-6"
          style={{ background: "#FFFFFF", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[15px] font-body font-semibold text-center" style={{ color: "#1A1A2E" }}>
            Send this code to your partner
          </p>
          <p
            className="font-heading font-extrabold text-[36px] text-center mt-3 tracking-[3px]"
            style={{ color: "#FF3B7A" }}
          >
            {myCode || "------"}
          </p>
          <p className="text-xs font-body text-center mt-2" style={{ color: "#999" }}>
            ⏱ {countdown || "Loading..."}
          </p>
          <button
            onClick={copyCode}
            className="w-full mt-4 py-3 rounded-[14px] text-[15px] font-body font-semibold transition-all"
            style={{
              background: "transparent",
              border: "1.5px solid #FF3B7A",
              color: "#FF3B7A",
            }}
          >
            {copied ? "Code copied! ✓" : "Send code"}
          </button>
        </motion.div>

        {/* Enter Code Card */}
        <motion.div
          className="rounded-[20px] p-5"
          style={{ background: "#FFFFFF", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[15px] font-body font-semibold text-center" style={{ color: "#1A1A2E" }}>
            Enter your partner's code
          </p>
          <input
            type="text"
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
            placeholder="Enter the code"
            maxLength={6}
            className="w-full mt-3 rounded-[14px] px-4 py-3.5 text-center font-body text-base focus:outline-none"
            style={{
              background: "#F5F5F5",
              color: "#1A1A2E",
            }}
          />
          <button
            onClick={searchPartner}
            disabled={partnerCode.trim().length < 4}
            className="w-full mt-4 py-3.5 rounded-[20px] text-white font-heading font-bold text-base transition-all"
            style={{
              background: partnerCode.trim().length >= 4
                ? "linear-gradient(135deg, #FF3B7A, #FF6B9D)"
                : "rgba(255,59,122,0.4)",
              boxShadow: partnerCode.trim().length >= 4
                ? "0 4px 20px rgba(255, 59, 122, 0.35)"
                : "none",
              opacity: partnerCode.trim().length >= 4 ? 1 : 0.4,
            }}
          >
            {loading ? "Searching..." : "Connect"}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ConnectPartnerScreen;
