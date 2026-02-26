import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { LogOut, User, Link, Copy, ChevronRight } from "lucide-react";
import ViblyButton from "@/components/ViblyButton";

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { profile, partner, daysCount } = useProfile();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const copyInviteCode = () => {
    if (profile?.invite_code) {
      navigator.clipboard.writeText(profile.invite_code);
      toast.success("Invite code copied!");
    }
  };

  const shareInviteCode = () => {
    if (!profile?.invite_code) return;
    const text = `Join me on Vibly! Use my invite code: ${profile.invite_code}`;
    if (navigator.share) {
      navigator.share({ title: "Vibly Invite", text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Invite link copied!");
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col mesh-bg noise-overlay vignette pb-24">
      <div className="flex items-center justify-between px-5 pt-14 pb-5 relative z-10">
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Settings</h1>
      </div>

      <div className="px-5 flex flex-col gap-4 relative z-10">
        {/* Profile Card */}
        <motion.div
          className="glass-card-elevated p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/12 flex items-center justify-center glow-rose">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-lg text-foreground">{profile?.name || "You"}</p>
              <p className="text-xs font-body text-muted-foreground">
                Member for {daysCount} day{daysCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Partner Status */}
        <motion.div
          className="glass-card-elevated p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-3">
            PARTNER STATUS
          </p>
          {partner ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/12 flex items-center justify-center glow-mint">
                <Link className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-foreground">Connected with {partner.name}</p>
                <p className="text-xs font-body text-muted-foreground">🔥 {profile?.streak_count || 0} day streak</p>
              </div>
              <span className="text-accent text-xs font-body font-semibold">Active</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber/12 flex items-center justify-center glow-amber">
                  <Link className="w-5 h-5 text-amber" />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-bold text-foreground">Not connected</p>
                  <p className="text-xs font-body text-muted-foreground">Share your invite code</p>
                </div>
              </div>

              {profile?.invite_code && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 glass-card px-4 py-3 rounded-option text-center">
                    <p className="font-heading font-extrabold text-xl text-foreground tracking-[0.15em]">
                      {profile.invite_code}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={copyInviteCode}
                    className="w-11 h-11 rounded-full bg-primary/12 flex items-center justify-center"
                  >
                    <Copy className="w-5 h-5 text-primary" />
                  </motion.button>
                </div>
              )}

              <div className="mt-3">
                <ViblyButton onClick={() => navigate("/connect")}>
                  Connect Partner →
                </ViblyButton>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="glass-card-elevated overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {!partner && profile?.invite_code && (
            <button
              onClick={shareInviteCode}
              className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors border-b border-white/[0.06]"
            >
              <span className="text-lg">📤</span>
              <span className="flex-1 text-sm font-body font-medium text-foreground">Share Invite Link</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
          >
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="flex-1 text-sm font-body font-medium text-destructive">
              {loggingOut ? "Logging out..." : "Log Out"}
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsScreen;
