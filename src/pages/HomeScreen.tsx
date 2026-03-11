import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useDailyQuestion } from "@/hooks/useDailyQuestion";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useInAppPurchase } from "@/hooks/useInAppPurchase";
import { usePushRegistration, getPushPermissionState } from "@/hooks/usePushRegistration";
import OptionCard from "@/components/OptionCard";
import DistanceBanner from "@/components/DistanceBanner";
import MoodScreen from "@/pages/MoodScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import { MessageCircle, Smile, BarChart3, Settings, Lock, Sparkles, Bell, X } from "lucide-react";

const PUSH_PROMPT_DISMISSED_KEY = "vibly_push_prompt_dismissed";

type TabId = "today" | "mood" | "weekly" | "settings";

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const { profile, partner, distance, daysCount, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { question, myAnswer, partnerAnswered, partnerAnswer, submitting, submitAnswer, refetch: refetchQuestion } = useDailyQuestion();
  const { isPremium } = useInAppPurchase();
  const { isNative, registerAndSaveToken } = usePushRegistration();
  useLocationTracking();

  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushPromptLoading, setPushPromptLoading] = useState(false);
  const [showPartnerConnected, setShowPartnerConnected] = useState(false);
  const [connectedPartnerName, setConnectedPartnerName] = useState("");
  const prevPartnerId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isNative) return;
    const check = async () => {
      const dismissed = localStorage.getItem(PUSH_PROMPT_DISMISSED_KEY);
      if (dismissed) return;
      const state = await getPushPermissionState();
      if (state === "prompt") setShowPushPrompt(true);
    };
    void check();
  }, [isNative]);

  // Realtime: detect when partner connects (partner_id changes from null to a value)
  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel(`home-profile-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${profile.id}` },
        (payload) => {
          const newPartnerId = (payload.new as any).partner_id;
          // Partner connected
          if (prevPartnerId.current === null && newPartnerId) {
            refetchProfile();
            refetchQuestion();
            supabase.from("profiles").select("name").eq("id", newPartnerId).maybeSingle().then(({ data }) => {
              setConnectedPartnerName(data?.name || "Your partner");
              setShowPartnerConnected(true);
              setTimeout(() => setShowPartnerConnected(false), 5000);
            });
          }
          // Partner unlinked — auto-logout
          if (prevPartnerId.current && !newPartnerId) {
            toast.info("Your partner unlinked. Logging out...");
            setTimeout(async () => {
              await supabase.auth.signOut();
              navigate("/");
            }, 1500);
          }
          prevPartnerId.current = newPartnerId;
        }
      )
      .subscribe();
    if (prevPartnerId.current === undefined) {
      prevPartnerId.current = profile.partner_id ?? null;
    }
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, profile?.partner_id]);

  const handlePushEnable = async () => {
    setPushPromptLoading(true);
    const result = await registerAndSaveToken();
    setPushPromptLoading(false);
    if (result.ok) {
      setShowPushPrompt(false);
      toast.success("Notifications enabled");
    } else if (result.error && result.error !== "Permission denied") {
      toast.error(result.error, { duration: 6000 });
    } else {
      setShowPushPrompt(false);
    }
  };

  const handlePushDismiss = () => {
    setShowPushPrompt(false);
    localStorage.setItem(PUSH_PROMPT_DISMISSED_KEY, "1");
  };

  const isPremiumUser = isPremium || profile?.subscription_status === "active" || profile?.subscription_status === "premium";

  const handleAnswer = async (index: number) => {
    if (myAnswer !== null || !question) return;
    await submitAnswer(index, question.options[index]);
    if (!isPremiumUser) navigate("/paywall");
  };

  // Render tab content inline — no early returns to keep hook order stable
  if (activeTab === "mood") {
    return (
      <div className="relative">
        <MoodScreen />
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} isPremium={isPremiumUser} refetchProfile={refetchProfile} refetchQuestion={refetchQuestion} />
      </div>
    );
  }

  if (activeTab === "settings") {
    return (
      <div className="relative">
        <SettingsScreen onPartnerUnlinked={refetchProfile} />
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} isPremium={isPremiumUser} refetchProfile={refetchProfile} refetchQuestion={refetchQuestion} />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col mesh-bg noise-overlay vignette pb-28">
      {/* Partner Connected Celebration Popup */}
      <AnimatePresence>
        {showPartnerConnected && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card-futuristic gradient-border p-8 mx-6 max-w-sm w-full text-center relative overflow-hidden"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-xl"
                    style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], y: [0, -40] }}
                    transition={{ duration: 2, delay: Math.random() * 0.5, repeat: Infinity }}
                  >
                    {["💕", "✨", "🎉", "💖"][i % 4]}
                  </motion.span>
                ))}
              </div>
              <div className="relative z-10">
                <motion.span
                  className="text-6xl block mb-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  💑
                </motion.span>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  {connectedPartnerName} connected with you!
                </h3>
                <p className="text-sm font-body text-muted-foreground mb-6">
                  You're now linked in Vibly. Start answering questions together! 💕
                </p>
                <button
                  onClick={() => setShowPartnerConnected(false)}
                  className="w-full py-3.5 rounded-[20px] text-white font-heading font-bold text-base bg-gradient-rose glow-rose-strong"
                >
                  Let's go! ✨
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-20 pb-5 relative z-10">
        <h1 className="font-heading font-extrabold text-2xl text-gradient-rose-lavender text-glow-gradient">Vibly</h1>
        <div className="flex items-center gap-2">
          <motion.span
            className="glass-card-futuristic gradient-border px-3.5 py-1.5 text-sm font-body font-semibold text-foreground flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            🔥 {profile?.streak_count ?? 0}
          </motion.span>
          <motion.span
            className="glass-card-futuristic gradient-border px-3.5 py-1.5 text-sm font-body font-semibold text-foreground flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            💕 {daysCount}d
          </motion.span>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4 relative z-10">
        {/* Push permission prompt on home — show when native and not yet granted */}
        <AnimatePresence>
          {showPushPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card-futuristic gradient-border p-4 rounded-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-foreground text-[15px]">Get notified</p>
                  <p className="text-[13px] font-body text-muted-foreground mt-0.5">
                    When your partner answers, when you get close, and more.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handlePushEnable}
                      disabled={pushPromptLoading}
                      className="py-2 px-4 rounded-xl bg-primary text-white text-xs font-heading font-bold disabled:opacity-60"
                    >
                      {pushPromptLoading ? "Enabling…" : "Enable"}
                    </button>
                    <button
                      onClick={handlePushDismiss}
                      className="py-2 px-4 rounded-xl text-xs font-body text-muted-foreground"
                    >
                      Not now
                    </button>
                  </div>
                </div>
                <button onClick={handlePushDismiss} className="p-1 shrink-0 text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Distance: premium only; free users see teaser */}
        {profile?.partner_id && isPremiumUser && (
          <DistanceBanner
            distance={distance}
            partnerName={partner?.name || "Partner"}
            partnerMood={partner?.current_mood || null}
          />
        )}
        {profile?.partner_id && !isPremiumUser && (
          <motion.button
            onClick={() => navigate("/paywall")}
            className="glass-card-futuristic gradient-border p-5 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-foreground">Connect Premium to see distance</p>
                <p className="text-[13px] font-body text-muted-foreground">See how far you and your partner are in real time</p>
              </div>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </motion.button>
        )}

        {/* Not connected banner */}
        {!profile?.partner_id && !profileLoading && (
          <motion.button
            onClick={() => navigate("/connect")}
            className="glass-card-futuristic gradient-border p-5 text-left relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Subtle animated shine */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            <div className="flex items-center gap-3 relative z-[1]">
              <div className="w-11 h-11 rounded-full bg-amber/12 flex items-center justify-center glow-amber">
                <span className="text-lg">💌</span>
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-[15px] text-foreground">Connect with your partner</p>
                <p className="text-[13px] font-body text-muted-foreground">Share your invite code to get started</p>
              </div>
              <motion.span
                className="text-lg text-primary"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </div>
          </motion.button>
        )}

        {/* Daily Question: free = 1 per day, then paywall */}
        {!isPremiumUser && myAnswer !== null && (
          <motion.div
            className="glass-card-futuristic gradient-border p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-heading font-bold text-foreground mb-2">You've used your free question for today</p>
            <p className="text-[15px] font-body text-muted-foreground mb-5">Unlock unlimited daily questions and more with Premium.</p>
            <button
              onClick={() => navigate("/paywall")}
              className="w-full py-4 rounded-[20px] text-white font-heading font-bold text-base bg-gradient-rose glow-rose-strong"
            >
              Unlock unlimited questions →
            </button>
          </motion.div>
        )}
        {question && (isPremiumUser || myAnswer === null) && (
          <motion.div
            className="glass-card-futuristic gradient-border p-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Top edge accent */}
            <div className="absolute -top-px left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <p className="text-xs font-body font-semibold text-primary/70 tracking-widest uppercase mb-3">
              TODAY'S QUESTION
            </p>
            <p className="text-[22px] font-heading font-bold text-foreground mb-5 leading-tight">
              {question.emoji} {question.text}
            </p>

            <div className="flex flex-col gap-2.5">
              {question.options.map((option, index) => (
                <OptionCard
                  key={index}
                  emoji={myAnswer !== null && partnerAnswer !== null && partnerAnswer === index ? "💕" : ""}
                  text={option}
                  selected={myAnswer === index}
                  onClick={() => handleAnswer(index)}
                />
              ))}
            </div>

            {myAnswer !== null && (
              <motion.p
                className="text-[13px] font-body text-muted-foreground text-center mt-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {partnerAnswer !== null
                  ? partnerAnswer === myAnswer
                    ? "🎉 You both matched!"
                    : `💬 ${partner?.name || "Partner"} picked: ${question.options[partnerAnswer]}`
                  : `🔒 ${partner?.name || "Partner"}'s answer is locked`}
              </motion.p>
            )}

            {myAnswer === null && (
              <p className="text-[14px] font-body text-muted-foreground text-center mt-5">
                {partnerAnswered ? `✅ ${partner?.name || "Partner"} already answered` : `🔒 ${partner?.name || "Partner"}'s answer is locked`}
              </p>
            )}
          </motion.div>
        )}

        {!question && !profileLoading && (
          <motion.div
            className="glass-card-futuristic gradient-border p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span
              className="text-4xl block mb-3"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💬
            </motion.span>
            <p className="font-heading font-bold text-foreground mb-1">No questions yet</p>
            <p className="text-[15px] font-body text-muted-foreground">Questions will appear here daily</p>
          </motion.div>
        )}
      </div>

      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} isPremium={isPremiumUser} refetchProfile={refetchProfile} refetchQuestion={refetchQuestion} />
    </div>
  );
};

function BottomTabBar({
  activeTab,
  setActiveTab,
  navigate,
  isPremium,
  refetchProfile,
  refetchQuestion,
}: {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  navigate: (path: string) => void;
  isPremium: boolean;
  refetchProfile: () => void;
  refetchQuestion: () => void;
}) {
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "today", label: "Today", icon: <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} /> },
    { id: "mood", label: "Mood", icon: <Smile className="w-[18px] h-[18px]" strokeWidth={2} /> },
    { id: "weekly", label: "Weekly", icon: <BarChart3 className="w-[18px] h-[18px]" strokeWidth={2} /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-[18px] h-[18px]" strokeWidth={2} /> },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] z-50">
      <div className="glass-card-futuristic p-1.5 flex items-center justify-around !rounded-[22px] relative overflow-hidden">
        {/* Subtle top edge shine */}
        <div className="absolute -top-px left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                if (tab.id === "weekly") {
                  if (!isPremium) navigate("/paywall");
                  else navigate("/weekly");
                } else {
                  setActiveTab(tab.id);
                  // Refresh data when switching tabs
                  refetchProfile();
                  if (tab.id === "today") refetchQuestion();
                }
              }}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-[16px] text-[10px] font-body font-semibold transition-all duration-200 relative ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-active"
                  className="absolute inset-0 bg-primary/10 rounded-[16px]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-[1]">{tab.icon}</span>
              <span className="relative z-[1]">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default HomeScreen;
