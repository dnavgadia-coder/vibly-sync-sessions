import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Check } from "lucide-react";
import { useInAppPurchase, type IAPPlanId } from "@/hooks/useInAppPurchase";

const features = [
  "Full premium access",
  "500+ couple questions & games",
  "Unlimited daily answers",
  "Live distance tracker",
  "Home screen widget",
  "Weekly sync cards",
];

const PaywallScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFromOnboarding = location.state?.from === "onboarding";
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");
  const [showClose, setShowClose] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const { isAvailable, isReady, loading, error, purchase, restore } = useInAppPurchase();

  useEffect(() => {
    const timer = setTimeout(() => setShowClose(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const goForward = () => {
    if (isFromOnboarding) {
      navigate("/connect", { state: { from: "onboarding" } });
    } else {
      navigate(-1);
    }
  };

  const handleContinue = async () => {
    if (!isAvailable) {
      // In browser or store not loaded — don't redirect; user must open the app to subscribe
      return;
    }
    const success = await purchase(selectedPlan as IAPPlanId);
    if (success) goForward();
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) goForward();
  };

  const handleClose = () => setShowDiscount(true);
  const handleClaimDiscount = async () => {
    if (!isAvailable) return;
    const success = await purchase(selectedPlan as IAPPlanId);
    if (success) goForward();
  };
  const handleDismissDiscount = () => goForward();

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden overflow-y-auto mesh-bg noise-overlay vignette">
      {/* Close button — appears after 3s */}
      <AnimatePresence>
        {showClose && !showDiscount && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute top-12 left-5 z-50 w-8 h-8 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Top illustration area */}
      <div className="flex items-center justify-center pt-14 pb-6 relative">
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

      {/* Card area */}
      <div className="flex-1 px-6 pt-6 pb-8 flex flex-col relative z-10">
        <h2 className="font-heading font-extrabold text-[26px] text-center text-foreground">
          Try Vibly Premium
        </h2>
        <p className="text-[15px] font-body font-semibold text-center mt-1 text-primary">
          Unlock the full experience
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
              <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                <Check className="w-3 h-3 text-primary" strokeWidth={3} />
              </div>
              <span className="text-[15px] font-body font-medium text-foreground/80">
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
            className={`relative rounded-[16px] p-4 text-left transition-all duration-200 glass-card ${
              selectedPlan === "monthly" ? "border-primary/40 border-2" : "border border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-body font-bold text-primary">Monthly</p>
                <p className="font-heading font-bold text-[17px] text-foreground">
                  $12.99 / month
                </p>
              </div>
              {selectedPlan === "monthly" && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          </button>

          {/* Yearly */}
          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`relative rounded-[16px] p-4 text-left transition-all duration-200 glass-card ${
              selectedPlan === "yearly" ? "border-primary/40 border-2" : "border border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-body font-bold text-primary">Yearly</p>
                <p className="font-heading font-bold text-[17px] text-foreground">
                  $39.99 / year
                </p>
                <p className="text-[13px] font-body text-muted-foreground">$3.33 / month</p>
              </div>
              {selectedPlan === "yearly" && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          </button>

          {/* SAVE badge */}
          <div className="flex justify-end -mt-1">
            <span className="text-[10px] font-body font-extrabold rounded-full px-2.5 py-1 text-primary-foreground bg-primary">
              SAVE 74%
            </span>
          </div>
        </div>

        {/* IAP error */}
        {error && (
          <p className="text-xs font-body text-destructive mt-2 text-center">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-4 rounded-[20px] text-white font-heading font-bold text-base mt-5 bg-gradient-rose glow-rose-strong disabled:opacity-60"
        >
          {loading
            ? "Processing…"
            : isAvailable && !isReady
              ? "Loading store…"
              : !isAvailable
                ? "Open the app to subscribe"
                : "Continue"}
        </button>

        {isAvailable && (
          <button
            type="button"
            onClick={handleRestore}
            disabled={loading}
            className="text-[11px] font-body text-primary mt-2 underline disabled:opacity-60"
          >
            Restore purchases
          </button>
        )}

        {!isAvailable && (
          <button
            type="button"
            onClick={goForward}
            className="text-[13px] font-body text-muted-foreground mt-3 underline"
          >
            Continue without subscribing
          </button>
        )}

        <p className="text-[10px] font-body text-center mt-3 text-muted-foreground">
          Terms of Use · Privacy Policy
        </p>
      </div>

      {/* Discount Popup */}
      <AnimatePresence>
        {showDiscount && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismissDiscount}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[70] px-6 pt-6 pb-8 glass-card-elevated"
              style={{ borderRadius: "24px 24px 0 0" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.2 }}
            >
              <button onClick={handleDismissDiscount} className="absolute top-4 right-5">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="flex flex-col items-center text-center">
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

                <p className="text-sm font-body font-semibold text-primary">
                  Special for you ❤️
                </p>

                <p className="font-heading font-black text-[48px] mt-1 text-gradient-rose-lavender">
                  81% OFF
                </p>

                <p className="text-[15px] font-body max-w-[300px] mt-2 leading-relaxed text-muted-foreground">
                  Unlock all premium benefits only today at a special price just for you.
                </p>

                <p className="text-[17px] font-body font-semibold mt-3 text-foreground">
                  $29.99 / year
                </p>

                <button
                  onClick={handleClaimDiscount}
                  disabled={loading}
                  className="w-full py-4 rounded-[20px] text-white font-heading font-bold text-base mt-5 bg-gradient-rose glow-rose-strong disabled:opacity-60"
                >
                  {loading ? "Processing…" : !isAvailable ? "Open the app to claim" : "Claim the offer"}
                </button>

                {!isAvailable && (
                  <button type="button" onClick={goForward} className="text-xs font-body text-muted-foreground mt-2 underline">
                    Continue without subscribing
                  </button>
                )}

                <p className="text-[10px] font-body mt-3 text-muted-foreground">
                  Terms of Use · Privacy Policy
                  {isAvailable && (
                    <>
                      {" · "}
                      <button type="button" onClick={handleRestore} disabled={loading} className="underline">
                        Restore
                      </button>
                    </>
                  )}
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
