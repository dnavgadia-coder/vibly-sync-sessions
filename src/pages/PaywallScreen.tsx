import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Check } from "lucide-react";

const features = [
  "Premium for you and your partner",
  "500+ couple questions & games",
  "Unlimited daily answers",
  "Live distance tracker",
  "Home screen widget",
  "Weekly sync cards",
];

const PaywallScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");
  const [showClose, setShowClose] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowClose(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    // In a real app, trigger payment here
    navigate("/connect");
  };

  const handleClose = () => {
    setShowDiscount(true);
  };

  const handleClaimDiscount = () => {
    navigate("/connect");
  };

  const handleDismissDiscount = () => {
    navigate("/connect");
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col relative overflow-hidden overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #FFF0F3 0%, #FFFFFF 40%)" }}
    >
      {/* Close button — appears after 3s */}
      <AnimatePresence>
        {showClose && !showDiscount && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute top-4 left-5 z-50 w-7 h-7 flex items-center justify-center"
          >
            <X className="w-5 h-5" style={{ color: "#999" }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Top illustration area */}
      <div
        className="flex items-center justify-center pt-14 pb-6 relative"
        style={{ background: "linear-gradient(180deg, #FFE4EC 0%, #FFF0F3 100%)" }}
      >
        <div className="relative">
          <motion.span
            className="text-5xl block"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            👩‍❤️‍👨
          </motion.span>
          {["💕", "💗", "✨", "💖"].map((e, i) => (
            <motion.span
              key={i}
              className="absolute text-base"
              style={{
                top: `${[-16, 0, -20, 8][i]}px`,
                left: `${[-28, 52, 24, -20][i]}px`,
              }}
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
            >
              {e}
            </motion.span>
          ))}
        </div>
      </div>

      {/* White card area */}
      <div
        className="flex-1 px-6 pt-6 pb-8 flex flex-col"
        style={{ background: "#FFFFFF", borderRadius: "28px 28px 0 0", marginTop: "-12px" }}
      >
        <h2
          className="font-heading font-extrabold text-[24px] text-center"
          style={{ color: "#1A1A2E" }}
        >
          Try Vibly Premium
        </h2>
        <p
          className="text-sm font-body font-semibold text-center mt-1"
          style={{ color: "#FF3B7A" }}
        >
          Your partner doesn't pay anything
        </p>

        {/* Feature list */}
        <div className="flex flex-col gap-2.5 mt-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
            >
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,59,122,0.1)" }}
              >
                <Check className="w-3 h-3" style={{ color: "#FF3B7A" }} strokeWidth={3} />
              </div>
              <span className="text-sm font-body font-medium" style={{ color: "#333" }}>
                {f}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Plan cards */}
        <div className="flex flex-col gap-2.5 mt-5">
          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan("monthly")}
            className="relative rounded-[16px] p-4 text-left transition-all duration-200"
            style={{
              background: "#FFF5F7",
              border: selectedPlan === "monthly" ? "2px solid #FF3B7A" : "1.5px solid #FFD0E0",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-body font-bold" style={{ color: "#FF3B7A" }}>Monthly</p>
                <p className="font-heading font-bold text-base" style={{ color: "#1A1A2E" }}>
                  $12.99 / month{" "}
                  <span className="font-normal text-xs" style={{ color: "#888" }}>for 2 users</span>
                </p>
                <p className="text-[11px] font-body" style={{ color: "#999" }}>$6.50 / user / month</p>
              </div>
              {selectedPlan === "monthly" && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#FF3B7A" }}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          </button>

          {/* Yearly (default selected) */}
          <button
            onClick={() => setSelectedPlan("yearly")}
            className="relative rounded-[16px] p-4 text-left transition-all duration-200"
            style={{
              background: "#FFF5F7",
              border: selectedPlan === "yearly" ? "2px solid #FF3B7A" : "1.5px solid #FFD0E0",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-body font-bold" style={{ color: "#FF3B7A" }}>Yearly</p>
                <p className="font-heading font-bold text-base" style={{ color: "#1A1A2E" }}>
                  $39.99 / year{" "}
                  <span className="font-normal text-xs" style={{ color: "#888" }}>for 2 users</span>
                </p>
                <p className="text-[11px] font-body" style={{ color: "#999" }}>$1.67 / user / month</p>
              </div>
              {selectedPlan === "yearly" && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#FF3B7A" }}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          </button>

          {/* SAVE badge */}
          <div className="flex justify-end -mt-1">
            <span
              className="text-[9px] font-body font-extrabold rounded-full px-2.5 py-1 text-white"
              style={{ background: "#FF3B7A" }}
            >
              SAVE 75%
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-[20px] text-white font-heading font-bold text-base mt-5"
          style={{
            background: "linear-gradient(135deg, #FF3B7A, #FF6B9D)",
            boxShadow: "0 4px 20px rgba(255, 59, 122, 0.35)",
          }}
        >
          Continue
        </button>

        <p className="text-[10px] font-body text-center mt-3" style={{ color: "#999" }}>
          Terms of Use · Privacy Policy
        </p>
      </div>

      {/* Discount Popup (Screen 20b) */}
      <AnimatePresence>
        {showDiscount && (
          <>
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.6)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismissDiscount}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[70] px-6 pt-6 pb-8"
              style={{ background: "#FFFFFF", borderRadius: "24px 24px 0 0" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.2 }}
            >
              {/* Close */}
              <button
                onClick={handleDismissDiscount}
                className="absolute top-4 right-5"
              >
                <X className="w-5 h-5" style={{ color: "#999" }} />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Gift */}
                <div className="relative mb-3">
                  <motion.span
                    className="text-[56px] block"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🎁
                  </motion.span>
                  {["✨", "✨"].map((e, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-sm"
                      style={{ top: `${[-8, -4][i]}px`, left: `${[-16, 56][i]}px` }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>

                <p className="text-sm font-body font-semibold" style={{ color: "#FF3B7A" }}>
                  Special for you ❤️
                </p>

                <p
                  className="font-heading font-black text-[48px] mt-1"
                  style={{ color: "#1A1A2E" }}
                >
                  81% OFF
                </p>

                <p
                  className="text-sm font-body max-w-[300px] mt-2 leading-relaxed"
                  style={{ color: "#555" }}
                >
                  Unlock all premium benefits only today at a special price just for you and your partner.
                </p>

                <p
                  className="text-base font-body font-semibold mt-3"
                  style={{ color: "#1A1A2E" }}
                >
                  $29.99 / year for 2 users
                </p>

                <button
                  onClick={handleClaimDiscount}
                  className="w-full py-4 rounded-[20px] text-white font-heading font-bold text-base mt-5"
                  style={{
                    background: "linear-gradient(135deg, #FF3B7A, #FF6B9D)",
                    boxShadow: "0 4px 20px rgba(255, 59, 122, 0.35)",
                  }}
                >
                  Claim the offer
                </button>

                <p className="text-[10px] font-body mt-3" style={{ color: "#999" }}>
                  Terms of Use · Privacy Policy · Restore
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaywallScreen;
