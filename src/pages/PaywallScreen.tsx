import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViblyButton from "@/components/ViblyButton";
import { Check, Sparkles } from "lucide-react";

const PaywallScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-8 relative overflow-hidden overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #FFF5F8 0%, #FFF0F4 30%, #FFFFFF 100%)",
      }}
    >
      {/* Soft rose ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full blur-[120px] pointer-events-none" style={{ background: "radial-gradient(circle, hsla(340,100%,80%,0.2) 0%, transparent 70%)" }} />

      <div className="flex-1 flex flex-col relative z-10">
        {/* Emoji composition */}
        <motion.div
          className="flex items-center justify-center gap-3 text-4xl mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          <span>💕</span>
          <Sparkles className="w-5 h-5 text-pink-400" />
          <span>✨</span>
        </motion.div>

        <motion.h2
          className="font-heading font-bold text-[24px] text-center mb-2"
          style={{ color: "#1A1A2E" }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Unlock your full Vibe Profile
        </motion.h2>

        <motion.p
          className="text-sm font-body text-center mb-8"
          style={{ color: "#6B6B8A" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Know each other on a deeper level
        </motion.p>

        {/* Plan cards */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Yearly */}
          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`relative rounded-card p-5 text-left transition-all duration-300 border-[1.5px] ${
              selectedPlan === "yearly"
                ? "border-pink-400 bg-pink-50 shadow-lg shadow-pink-200/40"
                : "border-gray-200 bg-white"
            }`}
          >
            {selectedPlan === "yearly" && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[10px] font-heading font-bold px-3 py-0.5 rounded-pill whitespace-nowrap shadow-md">
                BEST VALUE
              </span>
            )}
            <p className="text-xs font-body mb-1" style={{ color: "#6B6B8A" }}>Yearly</p>
            <p className="text-xl font-heading font-bold" style={{ color: "#1A1A2E" }}>$39.99</p>
            <p className="text-xs font-body" style={{ color: "#6B6B8A" }}>/year</p>
            <p className="text-xs font-body font-semibold mt-2 text-emerald-500">$0.77/week</p>
          </button>

          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`rounded-card p-5 text-left transition-all duration-300 border-[1.5px] ${
              selectedPlan === "monthly"
                ? "border-pink-400 bg-pink-50 shadow-lg shadow-pink-200/40"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-xs font-body mb-1" style={{ color: "#6B6B8A" }}>Monthly</p>
            <p className="text-xl font-heading font-bold" style={{ color: "#1A1A2E" }}>$12.99</p>
            <p className="text-xs font-body" style={{ color: "#6B6B8A" }}>/month</p>
            <p className="text-xs font-body mt-2" style={{ color: "#9A9ABF" }}>$3.25/week</p>
          </button>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col gap-4 pl-4">
            {[
              { day: "Today", desc: "Full access begins", active: true },
              { day: "Day 5", desc: "Reminder before renewal", active: false },
              { day: "Day 7", desc: "Billing starts", active: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 relative">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.active ? "bg-emerald-400 shadow-md shadow-emerald-300/50" : "bg-gray-200"}`}>
                  {item.active && <Check className="w-2 h-2 text-white m-auto mt-0.5" />}
                </div>
                {i < 2 && <div className="absolute left-[5.5px] top-4 w-px h-7 bg-gray-200" />}
                <div>
                  <p className="text-sm font-body font-semibold" style={{ color: "#1A1A2E" }}>{item.day}</p>
                  <p className="text-xs font-body" style={{ color: "#6B6B8A" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Callout */}
        <motion.div
          className="bg-pink-50 border border-pink-200/50 rounded-option p-4 mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm font-body leading-relaxed" style={{ color: "#1A1A2E" }}>
            Less than $1/week. Cheaper than one awkward silence. 😉
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ViblyButton variant="rose" onClick={() => navigate("/auth")}>
            Continue →
          </ViblyButton>
        </motion.div>

        {/* Fine print */}
        <motion.div
          className="text-center mt-5 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-[11px] font-body" style={{ color: "#9A9ABF" }}>
            Cancel anytime. Secure payment.
          </p>
          <p className="text-[11px] font-body underline cursor-pointer" style={{ color: "#9A9ABF" }}>
            Restore purchase
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PaywallScreen;