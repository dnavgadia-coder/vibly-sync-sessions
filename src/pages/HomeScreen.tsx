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
    <div className="min-h-screen flex flex-col bg-background grain-overlay pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <h1 className="font-heading font-black text-2xl text-foreground">Vibly</h1>
        <div className="flex items-center gap-2">
          <span className="bg-card border border-border rounded-pill px-3 py-1 text-xs font-body font-semibold text-foreground">
            🔥 14
          </span>
          <span className="bg-card border border-border rounded-pill px-3 py-1 text-xs font-body font-semibold text-foreground">
            💕 247d
          </span>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {/* Distance banner */}
        <motion.div
          className="bg-card border border-border rounded-card p-4 card-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg">📍</span>
              </div>
              <div>
                <p className="text-xs font-body text-muted-foreground">Distance apart</p>
                <p className="text-lg font-heading font-bold text-amber">847 km</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-body text-muted-foreground">Sarah's mood</p>
              <p className="text-2xl">😊</p>
            </div>
          </div>
        </motion.div>

        {/* Daily Question */}
        <motion.div
          className="bg-gradient-to-br from-card to-purple/10 border border-border rounded-card p-5 card-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[10px] font-body font-semibold text-muted-foreground tracking-widest uppercase mb-2">
            TODAY'S QUESTION
          </p>
          <p className="text-xl font-heading font-bold text-foreground mb-4">
            What's your dream vacation together?
          </p>

          <div className="flex flex-col gap-2">
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

          <p className="text-[13px] font-body text-muted-foreground text-center mt-4">
            🔒 Sarah's answer is locked
          </p>
        </motion.div>
      </div>

      {/* Floating Tab Bar */}
      <div className="fixed bottom-6 left-5 right-5 z-50">
        <div className="bg-card/90 frosted border border-border rounded-pill p-1.5 flex items-center justify-around card-shadow">
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
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-pill text-sm font-body font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground"
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
