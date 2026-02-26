import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useDailyQuestion } from "@/hooks/useDailyQuestion";
import OptionCard from "@/components/OptionCard";
import DistanceBanner from "@/components/DistanceBanner";
import MoodScreen from "@/pages/MoodScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import { Settings } from "lucide-react";

type TabId = "today" | "mood" | "weekly" | "settings";

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const { profile, partner, distance, daysCount, loading: profileLoading } = useProfile();
  const { question, myAnswer, partnerAnswered, partnerAnswer, submitting, submitAnswer } = useDailyQuestion();

  const handleAnswer = (index: number) => {
    if (myAnswer !== null || !question) return;
    submitAnswer(index, question.options[index]);
  };

  // Render tab content inline
  if (activeTab === "mood") {
    return (
      <div className="relative">
        <MoodScreen />
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
      </div>
    );
  }

  if (activeTab === "settings") {
    return (
      <div className="relative">
        <SettingsScreen />
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
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
        {/* Distance banner */}
        {profile?.partner_id && (
          <DistanceBanner
            distance={distance}
            partnerName={partner?.name || "Partner"}
            partnerMood={partner?.current_mood || null}
          />
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
                <p className="font-heading font-bold text-foreground">Connect with your partner</p>
                <p className="text-xs font-body text-muted-foreground">Share your invite code to get started</p>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
          </motion.button>
        )}

        {/* Daily Question */}
        {question && (
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

      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
    </div>
  );
};

function BottomTabBar({
  activeTab,
  setActiveTab,
  navigate,
}: {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  navigate: (path: string) => void;
}) {
  const tabs = [
    { id: "today" as TabId, emoji: "💬", label: "Today" },
    { id: "mood" as TabId, emoji: "😊", label: "Mood" },
    { id: "weekly" as TabId, emoji: "📊", label: "Weekly" },
    { id: "settings" as TabId, emoji: "⚙️", label: "Settings" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] z-50">
      <div className="glass-card-elevated p-1.5 flex items-center justify-around !rounded-pill">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "weekly") {
                navigate("/weekly");
              } else {
                setActiveTab(tab.id);
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-pill text-sm font-body font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary/12 text-primary glow-rose"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-base">{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default HomeScreen;
