import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import OptionCard from "@/components/OptionCard";

const quizQuestions = [
  {
    question: "What's your situation?",
    options: [
      { emoji: "💑", text: "In a relationship" },
      { emoji: "🤷", text: "It's complicated" },
      { emoji: "💬", text: "Talking stage" },
      { emoji: "💍", text: "Married" },
    ],
  },
  {
    question: "How long have you been together?",
    options: [
      { emoji: "🌱", text: "Less than 6 months" },
      { emoji: "🌿", text: "6–12 months" },
      { emoji: "🌳", text: "1–3 years" },
      { emoji: "🏔️", text: "3+ years" },
    ],
  },
  {
    question: "What's your biggest struggle?",
    options: [
      { emoji: "🤐", text: "We don't talk enough" },
      { emoji: "🙄", text: "Fight over dumb stuff" },
      { emoji: "😴", text: "Stuck in a routine" },
      { emoji: "😔", text: "Trust issues" },
    ],
  },
  {
    question: "When you disagree, what happens?",
    options: [
      { emoji: "🗣️", text: "We talk it out" },
      { emoji: "🧊", text: "Someone shuts down" },
      { emoji: "🔥", text: "It gets loud" },
      { emoji: "🙈", text: "We avoid it" },
    ],
  },
  {
    question: "Know your partner's love language?",
    options: [
      { emoji: "✅", text: "Yes, obviously" },
      { emoji: "🤔", text: "I think so?" },
      { emoji: "❓", text: "What's that?" },
      { emoji: "😬", text: "Never discussed it" },
    ],
  },
  {
    question: "Does your partner know your biggest insecurity?",
    options: [
      { emoji: "💚", text: "Yes, deeply" },
      { emoji: "🤏", text: "Parts of it" },
      { emoji: "🚫", text: "No way" },
      { emoji: "🫠", text: "I don't even know" },
    ],
  },
  {
    question: "What do you want from this?",
    options: [
      { emoji: "🧠", text: "Know each other deeper" },
      { emoji: "🎉", text: "More fun together" },
      { emoji: "🕊️", text: "Stop the same arguments" },
      { emoji: "💯", text: "All of the above" },
    ],
  },
  {
    question: "Where do you see this in 5 years?",
    options: [
      { emoji: "💒", text: "Married" },
      { emoji: "🧭", text: "Still figuring out" },
      { emoji: "🌱", text: "Growing together" },
      { emoji: "✨", text: "Living our best life" },
    ],
  },
  {
    question: "If they HAD to answer honestly, about what?",
    options: [
      { emoji: "⏪", text: "Their past" },
      { emoji: "💗", text: "Feelings about me" },
      { emoji: "🔮", text: "Our future" },
      { emoji: "🤫", text: "Something they're hiding" },
    ],
  },
];

const TOTAL_ONBOARDING_STEPS = 12;

const QuizScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const stepNumber = currentQ + 2; // quiz starts at step 2
  const progress = Math.round((stepNumber / TOTAL_ONBOARDING_STEPS) * 100);
  const q = quizQuestions[currentQ];
  if (!q) return null;

  const handleSelect = (index: number) => {
    setSelected(index);
    setTimeout(() => {
      if (currentQ < quizQuestions.length - 1) {
        setCurrentQ((prev) => prev + 1);
        setSelected(null);
      } else {
        navigate("/insight");
      }
    }, 400);
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ((prev) => prev - 1);
      setSelected(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 mesh-bg noise-overlay vignette">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-[13px] font-body text-foreground/70">Step {stepNumber} of {TOTAL_ONBOARDING_STEPS}</span>
      </div>

      <ProgressBar progress={progress} />

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.h2
            key={currentQ}
            className="font-heading font-bold text-[28px] text-foreground mb-10 leading-tight"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {q.question}
          </motion.h2>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            className="flex flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {q.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <OptionCard
                  emoji={option.emoji}
                  text={option.text}
                  selected={selected === index}
                  onClick={() => handleSelect(index)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizScreen;
