# Vibly — App Store Submission Checklist

This guide covers **In-App Purchase (IAP)** and **Location** setup so you can submit Vibly for App Store review.

---

## 1. Location permission (done in this project)

**Status:** Permission strings are updated for the couples/distance feature.

- **Info.plist** already includes:
  - `NSLocationWhenInUseUsageDescription` — used when the app shows distance between you and your partner.
  - `NSLocationAlwaysAndWhenInUseUsageDescription` — used if you add background location later.

**How location is used in Vibly:**

- The web app uses **Geolocation** (and optionally `@capacitor/geolocation` on native) to get the user’s position.
- **`useLocationTracking`** writes `location_lat`, `location_lng`, `location_updated_at` to the **profiles** table in Supabase.
- For each couple, the app computes **distance** (Haversine) and stores `distance_km` / `distance_updated_at` on the **couples** table.
- **DistanceBanner** on the home screen shows how far apart the two partners are.

**Optional for more reliable iOS behavior:** Install the official Capacitor Geolocation plugin in the **project root** (where `package.json` lives):

```bash
npm install @capacitor/geolocation
npx cap sync
```

Then in the web app you can use `import { Geolocation } from '@capacitor/geolocation'` and request permissions / get position via the plugin. The current `navigator.geolocation` flow will still work if you keep the plist strings as they are.

---

## 2. In-App Purchase (IAP)

**Status:** Paywall UI exists; you need to connect it to real Apple IAP and (optionally) backend.

### 2.1 Enable In-App Purchase in Xcode

1. Open **`App.xcodeproj`** in Xcode.
2. Select the **App** target → **Signing & Capabilities**.
3. Click **+ Capability** and add **In-App Purchase**.

### 2.2 Test without App Store Connect (optional)

To test the purchase flow **without creating products in App Store Connect**, use the plugin’s test mode:

1. In the **project root**, add to your `.env` (or create it): `VITE_IAP_TEST_MODE=true`
2. Rebuild and sync: `npm run build && npx cap sync ios`
3. Run the app on simulator or device. Tapping **Continue** on the paywall shows a **test dialog**: *"Do you want to purchase …? Enter Y to confirm, E to fail."* — no real charge.
4. **Before release:** Remove or set `VITE_IAP_TEST_MODE=false` and create real products in App Store Connect.

### 2.3 Create products in App Store Connect (for production)

**Product IDs (match exactly):** Yearly `com.app.vibly.premium.yearly` · Monthly `com.app.vibly.premium.monthly`.  
Full flow and copy-paste content: **[APP_STORE_CONNECT_IAP.md](./APP_STORE_CONNECT_IAP.md)**.

1. In [App Store Connect](https://appstoreconnect.apple.com), open your app → **Features** → **In-App Purchases**.
2. Create at least:
   - **Subscription** (or non-consumable): e.g. `com.app.vibly.premium.yearly` — “Vibly Premium (Yearly)”.
   - Optionally: `com.app.vibly.premium.monthly` for monthly.
3. Use the **exact product IDs** in your app code when calling the IAP plugin.

### 2.4 Add an IAP plugin to the Capacitor app

From the **project root** (parent of `ios/`), install the Cordova plugin (Capacitor-recommended):

```bash
npm install cordova-plugin-purchase
npx cap sync
```

The app already has a **PaywallScreen** wired to **`useInAppPurchase`** (`src/hooks/useInAppPurchase.ts`). The hook calls `store.order(productId)` and `store.restore()` when the plugin is loaded on a native build. Product IDs are in `IAP_PRODUCT_IDS` (e.g. `com.app.vibly.premium.yearly`) — ensure these match your App Store Connect product IDs. After the plugin is installed, you may need to adapt the hook to the plugin’s exact API (e.g. `CdvPurchase` / event-based API); see [purchase.cordova.fovea.cc](https://purchase.cordova.fovea.cc/).

### 2.5 Wire PaywallScreen to real IAP

- **“Continue” / “Claim the offer”** should trigger a **purchase** or **restore** via the chosen plugin (e.g. `purchase.order()` or equivalent), not just navigation.
- After a successful purchase, update **subscription_status** in your Supabase **profiles** (e.g. via a Cloud Function or your backend that validates the receipt).
- Show **Restore** on the paywall and call the plugin’s restore method.

### 2.6 Testing

- Use **StoreKit Configuration** in Xcode (or **Sandbox** testers in App Store Connect) to test IAP without real charges.
- Ensure the paywall appears when the user is not premium and that premium features (e.g. distance, full questions) are gated by `subscription_status` or equivalent.

---

## 3. Summary

| Item | Action |
|------|--------|
| **App name** | Already “Vibly” in Info.plist and Capacitor config. |
| **Location** | Permission strings updated for “distance between partners”. Logic lives in web app + Supabase. |
| **IAP** | Add In-App Purchase capability in Xcode; create products in App Store Connect; add IAP plugin; connect PaywallScreen to purchase/restore and backend. |

After IAP and location are correctly set up, you can submit Vibly for App Store review.
