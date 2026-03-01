import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { createNotificationForUser } from "@/hooks/useNotifications";

const ConnectPartnerScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFromOnboarding = location.state?.from === "onboarding";
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
      if (data?.partner_id) { navigate("/home"); return; }
      if (data?.invite_code) setMyCode(data.invite_code);
      if (data?.invite_code_expires_at) setExpiresAt(new Date(data.invite_code_expires_at));
    };
    fetchMyCode();
  }, [navigate]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, expiresAt.getTime() - Date.now());
      if (diff === 0) { setCountdown("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(h > 0 ? `${h}h ${m}m remaining` : `${m}:${s.toString().padStart(2, "0")} remaining`);
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
    if (partnerCode.trim().length < 4) { toast.error("Enter a valid code"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("find_user_by_invite_code", { _code: partnerCode.trim() });
      if (error) throw error;
      if (!data || data.length === 0) { toast.error("No match found. Check the code."); return; }
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
      const { error } = await supabase.rpc("link_partners", { _partner_id: foundPartner.id });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      const { data: myProfile } = user
        ? await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle()
        : { data: null };
      const myName = myProfile?.name || "Your partner";
      createNotificationForUser(
        foundPartner.id,
        "partner_joined",
        `${myName} connected with you! 💕`,
        "You're now linked in Vibly. Start your journey together!",
        { partner_id: user?.id }
      ).catch(() => {});

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
              className="w-full py-4 rounded-[20px] text-white font-heading font-bold text-base bg-gradient-rose glow-rose-strong"
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
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 relative mesh-bg noise-overlay vignette">
      <div className="flex-1 flex flex-col relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h2 className="font-heading font-extrabold text-[28px] text-foreground mb-2">
            Connect with Your Partner
          </h2>
          <p className="text-[15px] font-body text-muted-foreground">
            All your details, including answers and journal entries will be shared with your partner.
          </p>
        </motion.div>

        {/* Send Code Card */}
        <motion.div
          className="glass-card p-5 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[15px] font-body font-semibold text-center text-foreground">
            Send this code to your partner
          </p>
          <p className="font-heading font-extrabold text-[36px] text-center mt-3 tracking-[3px] text-primary">
            {myCode || "------"}
          </p>
          <p className="text-[13px] font-body text-center mt-2 text-muted-foreground">
            ⏱ {countdown || "Loading..."}
          </p>
          <button
            onClick={copyCode}
            className="w-full mt-4 py-3 rounded-[14px] text-[15px] font-body font-semibold transition-all flex items-center justify-center gap-2 border border-primary/40 text-primary hover:bg-primary/10"
          >
            {copied ? (
              <><Check className="w-4 h-4" /> Code copied!</>
            ) : (
              <><Copy className="w-4 h-4" /> Send code</>
            )}
          </button>
        </motion.div>

        {/* Enter Code Card */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[15px] font-body font-semibold text-center text-foreground">
            Enter your partner's code
          </p>
          <input
            type="text"
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
            placeholder="Enter the code"
            maxLength={8}
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            className="w-full mt-3 rounded-[14px] px-4 py-3.5 text-center font-body text-base focus:outline-none bg-input text-foreground placeholder:text-muted-foreground border border-border focus:border-primary/30 transition-colors"
          />
          <button
            onClick={searchPartner}
            disabled={partnerCode.trim().length < 4}
            className="w-full mt-4 py-3.5 rounded-[20px] text-white font-heading font-bold text-base transition-all bg-gradient-rose disabled:opacity-40 disabled:shadow-none glow-rose-strong"
            style={{ boxShadow: partnerCode.trim().length >= 4 ? undefined : "none" }}
          >
            {loading ? "Searching..." : "Connect"}
          </button>
        </motion.div>
      </div>

      {/* Not now — below connect content */}
      <motion.div
        className="relative z-10 mt-6 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={() => isFromOnboarding ? navigate("/notification", { state: { from: "onboarding" } }) : navigate(-1)}
          className="text-[15px] font-body font-medium text-muted-foreground hover:text-foreground/70 transition-colors"
        >
          Not now
        </button>
      </motion.div>
    </div>
  );
};

export default ConnectPartnerScreen;
