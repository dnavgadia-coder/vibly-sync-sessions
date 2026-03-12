/**
 * In-App Purchase hook for Vibly (App Store + Google Play).
 *
 * 1. Install: npm install cordova-plugin-purchase && npx cap sync
 * 2. iOS — Xcode: App target → Signing & Capabilities → + In-App Purchase
 *    iOS — App Store Connect: create products with the IDs below
 * 3. Android — Google Play Console: create subscriptions with the same IDs below
 *    Android — enable Google Play Billing in your app listing
 *
 * TEST MODE (no store accounts needed):
 * Set VITE_IAP_TEST_MODE=true in .env to use the plugin's test platform.
 * A dialog will ask "Do you want to purchase...? Enter Y to confirm, E to fail."
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";

export const IAP_PRODUCT_IDS = {
  yearly: "com.app.vibly.premium.yearly",
  monthly: "com.app.vibly.premium.monthly",
} as const;

export type IAPPlanId = keyof typeof IAP_PRODUCT_IDS;

/** Enable in .env (VITE_IAP_TEST_MODE=true) to test purchases without a store account. */
export const IAP_TEST_MODE = import.meta.env.VITE_IAP_TEST_MODE === "true";

declare global {
  interface Window {
    CdvPurchase?: {
      store?: {
        initialize: (platforms: unknown[]) => Promise<unknown>;
        register: (products: unknown[]) => void;
        get: (productId: string, platform?: number) => { getOffer: () => { order: (additionalData?: unknown) => Promise<undefined | { isError?: boolean; message?: string }> } } | undefined;
        restorePurchases: () => Promise<unknown>;
        update?: () => Promise<unknown>;
        ready: (cb: () => void) => void;
        isReady?: boolean;
        when: () => { receiptsReady: (cb: () => void) => void; verified: (cb: (receipt: unknown) => void) => void };
        owned?: (product: string | { id: string }) => boolean;
      };
      Platform?: { APPLE_APPSTORE: number; GOOGLE_PLAY: number; TEST: number };
      ProductType?: { PAID_SUBSCRIPTION: number };
    };
  }
}

const isNative = Capacitor.isNativePlatform();
const currentPlatform = Capacitor.getPlatform(); // "ios" | "android" | "web"

function getStore() {
  return typeof window !== "undefined" ? window.CdvPurchase?.store : undefined;
}

function getPlatform(): number | undefined {
  const P = typeof window !== "undefined" ? window.CdvPurchase?.Platform : undefined;
  if (!P) return undefined;
  if (IAP_TEST_MODE) return P.TEST;
  return currentPlatform === "android" ? P.GOOGLE_PLAY : P.APPLE_APPSTORE;
}

function getProductType() {
  return typeof window !== "undefined" ? window.CdvPurchase?.ProductType?.PAID_SUBSCRIPTION : undefined;
}

export function useInAppPurchase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);

  const initStore = useCallback(async () => {
    const store = getStore();
    const platform = getPlatform();
    const productType = getProductType();
    if (!store || platform === undefined || productType === undefined || initRef.current) return;
    initRef.current = true;
    try {
      // Register products BEFORE initialize so adapters (especially TEST) receive them when they load
      if (IAP_TEST_MODE) {
        store.register([
          {
            id: IAP_PRODUCT_IDS.yearly,
            type: productType,
            platform,
            title: "Vibly Premium (Yearly)",
            description: "Yearly subscription for testing",
            pricing: { price: "$39.99", currency: "USD", priceMicros: 3999000 },
          },
          {
            id: IAP_PRODUCT_IDS.monthly,
            type: productType,
            platform,
            title: "Vibly Premium (Monthly)",
            description: "Monthly subscription for testing",
            pricing: { price: "$12.99", currency: "USD", priceMicros: 1299000 },
          },
        ]);
      } else {
        store.register([
          { id: IAP_PRODUCT_IDS.yearly, type: productType, platform },
          { id: IAP_PRODUCT_IDS.monthly, type: productType, platform },
        ]);
      }
      await store.initialize([platform]);
      if (store.ready) {
        store.ready(() => setIsReady(true));
      } else {
        setIsReady(true);
      }
    } catch (e) {
      console.warn("[IAP] init failed", e);
    }
  }, []);

  const checkOwnedAndSetPremium = useCallback(() => {
    const store = getStore();
    if (!store?.owned) return;
    try {
      const ownedYearly = store.owned(IAP_PRODUCT_IDS.yearly);
      const ownedMonthly = store.owned(IAP_PRODUCT_IDS.monthly);
      if (ownedYearly || ownedMonthly) setIsPremium(true);
    } catch (_) {
      // Fallback: check verifiedPurchases if owned() not available
      const vp = (store as { verifiedPurchases?: { productId?: string }[] }).verifiedPurchases;
      if (Array.isArray(vp) && vp.some((p) => p.productId === IAP_PRODUCT_IDS.yearly || p.productId === IAP_PRODUCT_IDS.monthly)) {
        setIsPremium(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isNative || !isReady) return;
    const store = getStore();
    if (!store) return;
    checkOwnedAndSetPremium();
    try {
      store.when().receiptsReady(checkOwnedAndSetPremium);
    } catch (_) {}
    const t1 = setTimeout(checkOwnedAndSetPremium, 600);
    const t2 = setTimeout(checkOwnedAndSetPremium, 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isReady, checkOwnedAndSetPremium]);

  useEffect(() => {
    if (!isNative) return;
    const tryInit = () => {
      if (getStore()) initStore();
    };
    tryInit();
    document.addEventListener("deviceready", tryInit, { once: true });
    const t1 = setTimeout(tryInit, 500);
    const t2 = setTimeout(tryInit, 2000);
    return () => {
      document.removeEventListener("deviceready", tryInit);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [initStore]);

  // When store was already initialized by another screen, sync isReady so we run ownership check
  useEffect(() => {
    if (!isNative) return;
    const store = getStore();
    if (store?.isReady) {
      setIsReady(true);
      return;
    }
    const id = setInterval(() => {
      if (getStore()?.isReady) setIsReady(true);
    }, 400);
    return () => clearInterval(id);
  }, []);

  const purchase = useCallback(
    async (plan: IAPPlanId): Promise<boolean> => {
      setError(null);
      setLoading(true);
      try {
        if (!isNative) {
          setError("In-app purchase is only available in the app.");
          return false;
        }
        const store = getStore();
        const platform = getPlatform();
        if (!store || platform === undefined) {
          setError("Purchase plugin not loaded. Run: npm install cordova-plugin-purchase && npx cap sync");
          return false;
        }
        const productId = IAP_PRODUCT_IDS[plan];
        let product = store.get(productId, platform);
        if (!product) {
          await new Promise((r) => setTimeout(r, 600));
          product = store.get(productId, platform);
        }
        if (!product) {
          await new Promise((r) => setTimeout(r, 1200));
          product = store.get(productId, platform);
        }
        if (!product && typeof store.update === "function") {
          try {
            await store.update();
            await new Promise((r) => setTimeout(r, 800));
            product = store.get(productId, platform);
          } catch (_) {}
        }
        if (!product) {
          await new Promise((r) => setTimeout(r, 1500));
          product = store.get(productId, platform);
        }
        if (!product) {
          setError("Product not loaded yet. Try again in a moment.");
          return false;
        }
        const offer = product.getOffer?.();
        if (!offer?.order) {
          setError("Product not available.");
          return false;
        }
        const result = await offer.order();
        if (result && "isError" in result && result.isError) {
          setError(result.message ?? "Purchase failed.");
          return false;
        }
        setIsPremium(true);
        return true;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Purchase failed";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const restore = useCallback(async (): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      if (!isNative) {
        setError("Restore is only available in the app.");
        return false;
      }
      const store = getStore();
      if (!store?.restorePurchases) {
        setError("Purchase plugin not loaded.");
        return false;
      }
      await store.restorePurchases();
      setIsPremium(true);
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Restore failed";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isAvailable: isNative,
    isReady,
    isPremium,
    loading,
    error,
    purchase,
    restore,
  };
}
