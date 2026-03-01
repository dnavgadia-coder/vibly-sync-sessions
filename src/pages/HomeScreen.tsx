import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  const { question, myAnswer, partnerAnswered, partnerAnswer, submitting, submitAnswer } = useDailyQuestion();
  const { isPremium } = useInAppPurchase();
  const { isNative, registerAndSaveToken } = usePushRegistration();
  useLocationTracking();

  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushPromptLoading, setPushPromptLoading] = useState(false);

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
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} isPremium={isPremiumUser} />
      </div>
    );
  }

  if (activeTab === "settings") {
    return (
      <div className="relative">
        <SettingsScreen onPartnerUnlinked={refetchProfile} />
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} isPremium={isPremiumUser} />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col mesh-bg noise-overlay vignette pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-5 relative z-10">
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Vibly</h1>
        <div className="flex items-center gap-2">
          <span className="glass-card px-3 py-1.5 text-xs font-body font-semibold text-foreground">
            🔥 {profile?.streak_count ?? 0}
          </span>
          <span className="glass-card px-3 py-1.5 text-xs font-body font-semibold text-foreground">
            💕 {daysCount}d
          </span>
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
              className="glass-card-elevated p-4 rounded-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-foreground text-sm">Get notified</p>
                  <p className="text-xs font-body text-muted-foreground mt-0.5">
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
            className="glass-card-elevated p-5 text-left"
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
                <p className="text-xs font-body text-muted-foreground">See how far you and your partner are in real time</p>
              </div>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </motion.button>
        )}

        {/* Not connected banner */}
        {!profile?.partner_id && !profileLoading && (
          <motion.button
            onClick={() => navigate("/connect")}
            className="glass-card-elevated p-5 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber/12 flex items-center justify-center glow-amber">
                <span className="text-lg">💌</span>
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-[15px] text-foreground">Connect with your partner</p>
                <p className="text-[13px] font-body text-muted-foreground">Share your invite code to get started</p>
              </div>
              <span className="text-lg text-muted-foreground">→</span>
            </div>
          </motion.button>
        )}

        {/* Daily Question: free = 1 per day, then paywall */}
        {!isPremiumUser && myAnswer !== null && (
          <motion.div
            className="glass-card-elevated p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-heading font-bold text-foreground mb-2">You've used your free question for today</p>
            <p className="text-sm font-body text-muted-foreground mb-5">Unlock unlimited daily questions and more with Premium.</p>
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
            className="glass-card-elevated p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsla(240,29%,10%,0.6) 0%, hsla(263,86%,76%,0.06) 100%)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-lavender/20 to-transparent" />

            <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-3">
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
              <p className="text-[13px] font-body text-muted-foreground text-center mt-5">
                {partnerAnswered ? `✅ ${partner?.name || "Partner"} already answered` : `🔒 ${partner?.name || "Partner"}'s answer is locked`}
              </p>
            )}
          </motion.div>
        )}

        {!question && !profileLoading && (
          <motion.div
            className="glass-card-elevated p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-4xl block mb-3">💬</span>
            <p className="font-heading font-bold text-foreground mb-1">No questions yet</p>
            <p className="text-sm font-body text-muted-foreground">Questions will appear here daily</p>
          </motion.div>
        )}
      </div>

      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} isPremium={isPremiumUser} />
    </div>
  );
};

function BottomTabBar({
  activeTab,
  setActiveTab,
  navigate,
  isPremium,
}: {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  navigate: (path: string) => void;
  isPremium: boolean;
}) {
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "today", label: "Today", icon: <MessageCircle className="w-5 h-5" strokeWidth={2} /> },
    { id: "mood", label: "Mood", icon: <Smile className="w-5 h-5" strokeWidth={2} /> },
    { id: "weekly", label: "Weekly", icon: <BarChart3 className="w-5 h-5" strokeWidth={2} /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" strokeWidth={2} /> },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] z-50">
      <div className="glass-card-elevated p-1.5 flex items-center justify-around !rounded-[22px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "weekly") {
                  if (!isPremium) navigate("/paywall");
                  else navigate("/weekly");
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-[18px] text-sm font-body font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HomeScreen;
