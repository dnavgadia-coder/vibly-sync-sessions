import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViblyButton from "@/components/ViblyButton";
import { Check } from "lucide-react";

const PaywallScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");

  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8 bg-background grain-overlay overflow-y-auto">
      <div className="flex-1 flex flex-col">
        <motion.h2
          className="font-heading font-bold text-[22px] text-foreground text-center mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Unlock your full Vibe Profile
        </motion.h2>

        {/* Plan cards */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Yearly */}
          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`relative rounded-card p-4 text-left transition-all duration-200 border-[1.5px] ${
              selectedPlan === "yearly"
                ? "border-primary bg-primary/[0.08] glow-pink"
                : "border-border bg-card"
            }`}
          >
            {selectedPlan === "yearly" && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-pink text-primary-foreground text-[10px] font-heading font-bold px-3 py-0.5 rounded-pill whitespace-nowrap">
                BEST VALUE
              </span>
            )}
            <p className="text-xs font-body text-muted-foreground mb-1">Yearly</p>
            <p className="text-lg font-heading font-bold text-foreground">$49.99</p>
            <p className="text-xs font-body text-muted-foreground">/year</p>
            <p className="text-xs font-body text-accent mt-2">$0.96/week</p>
          </button>

          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`rounded-card p-4 text-left transition-all duration-200 border-[1.5px] ${
              selectedPlan === "monthly"
                ? "border-primary bg-primary/[0.08] glow-pink"
                : "border-border bg-card"
            }`}
          >
            <p className="text-xs font-body text-muted-foreground mb-1">Monthly</p>
            <p className="text-lg font-heading font-bold text-foreground">$6.99</p>
            <p className="text-xs font-body text-muted-foreground">/month</p>
            <p className="text-xs font-body text-muted-foreground mt-2">$1.75/week</p>
          </button>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex flex-col gap-3 pl-4">
            {[
              { day: "Today", desc: "Start free trial", active: true },
              { day: "Day 2", desc: "Reminder", active: false },
              { day: "Day 3", desc: "Billing starts", active: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 relative">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.active ? "bg-accent glow-green" : "bg-secondary"}`}>
                  {item.active && <Check className="w-2 h-2 text-accent-foreground m-auto mt-0.5" />}
                </div>
                {i < 2 && <div className="absolute left-[5.5px] top-4 w-px h-6 bg-border" />}
                <div>
                  <p className="text-sm font-body font-semibold text-foreground">{item.day}</p>
                  <p className="text-xs font-body text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Callout */}
        <motion.div
          className="bg-primary/[0.08] border border-primary/20 rounded-option p-3 mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm font-body text-foreground">
            Less than $1/week. Cheaper than one awkward silence.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ViblyButton variant="green" onClick={() => navigate("/home")}>
            Try Free for 3 Days
          </ViblyButton>
        </motion.div>

        {/* Fine print */}
        <motion.div
          className="text-center mt-4 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-[11px] font-body text-muted-foreground">
            Cancel anytime. No charge until Day 3.
          </p>
          <p className="text-[11px] font-body text-muted-foreground underline cursor-pointer">
            Restore purchase
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PaywallScreen;
