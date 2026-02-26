import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import OptionCard from "@/components/OptionCard";

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"today" | "mood" | "weekly">("today");

  const answerOptions = [
    { emoji: "🏖️", text: "Beach vacation" },
    { emoji: "🏔️", text: "Mountain cabin" },
    { emoji: "🌆", text: "City trip" },
    { emoji: "🚗", text: "Road trip" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background grain-overlay vignette pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-5 relative z-10">
        <h1 className="font-heading font-black text-2xl text-foreground">Vibly</h1>
        <div className="flex items-center gap-2">
          <span className="bg-card inner-shadow border border-border rounded-pill px-3 py-1.5 text-xs font-body font-semibold text-foreground">
            🔥 14
          </span>
          <span className="bg-card inner-shadow border border-border rounded-pill px-3 py-1.5 text-xs font-body font-semibold text-foreground">
            💕 247d
          </span>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4 relative z-10">
        {/* Distance banner */}
        <motion.div
          className="card-cinematic border border-border rounded-card p-5 light-sweep"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center glow-pink">
                <span className="text-lg">📍</span>
              </div>
              <div>
                <p className="text-xs font-body text-muted-foreground mb-0.5">Distance apart</p>
                <p className="text-lg font-heading font-bold text-amber text-glow-amber">847 km</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-body text-muted-foreground mb-0.5">Sarah's mood</p>
              <motion.p
                className="text-2xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                😊
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Daily Question */}
        <motion.div
          className="bg-gradient-to-br from-card to-purple/[0.06] border border-border rounded-card p-6 card-shadow-deep inner-shadow relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Subtle purple glow edge */}
          <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple/25 to-transparent" />

          <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-3">
            TODAY'S QUESTION
          </p>
          <p className="text-[22px] font-heading font-bold text-foreground mb-5 leading-tight">
            What's your dream vacation together?
          </p>

          <div className="flex flex-col gap-2.5">
            {answerOptions.map((option, index) => (
              <OptionCard
                key={index}
                emoji={option.emoji}
                text={option.text}
                selected={selectedAnswer === index}
                onClick={() => setSelectedAnswer(index)}
              />
            ))}
          </div>

          <p className="text-[13px] font-body text-muted-foreground text-center mt-5">
            🔒 Sarah's answer is locked
          </p>
        </motion.div>
      </div>

      {/* Floating Tab Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] z-50">
        <div className="bg-card/80 frosted-strong border border-border rounded-pill p-1.5 flex items-center justify-around card-shadow-deep inner-shadow">
          {[
            { id: "today" as const, emoji: "💬", label: "Today" },
            { id: "mood" as const, emoji: "😊", label: "Mood" },
            { id: "weekly" as const, emoji: "📊", label: "Weekly" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "weekly") navigate("/weekly");
              }}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-pill text-sm font-body font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary/15 text-primary glow-pink"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
