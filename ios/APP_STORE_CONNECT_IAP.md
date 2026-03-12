# App Store Connect — In-App Purchase Setup for Vibly

Use this guide to create and configure your **real** Apple In-App Purchase products so the app can connect to Apple’s default IAP. Product IDs must match exactly what the app uses.

---

## 1. Product IDs (must match exactly)

Create these two products in App Store Connect. **Copy the IDs exactly** — no extra spaces or different characters.

| Plan    | Product ID (exact)              | Use in app |
|---------|----------------------------------|------------|
| Yearly  | `com.app.vibly.premium.yearly`   | Default / recommended |
| Monthly | `com.app.vibly.premium.monthly` | Alternative |

These are already defined in the app in `src/hooks/useInAppPurchase.ts` as `IAP_PRODUCT_IDS`. Do not change the product IDs in App Store Connect once the app is live (or you must update the app code to match).

---

## 2. App Store Connect — Step-by-step

### 2.1 Open your app and go to In-App Purchases

1. Go to [App Store Connect](https://appstoreconnect.apple.com).
2. Open **My Apps** → select **Vibly** (or create the app if needed).
3. In the left sidebar, under your app, go to **Features** → **In-App Purchases**.

### 2.2 Create a Subscription Group (first time only)

1. If you don’t have a subscription group yet, click **+** or **Create** under **Subscription Groups**.
2. **Reference Name:** `Vibly Premium`  
   (Internal name; users don’t see this.)
3. Click **Create**.

### 2.3 Create the Yearly subscription

1. In the subscription group, click **+** to add a subscription.
2. **Type:** **Auto-Renewable Subscription**.
3. **Reference Name:** `Vibly Premium Yearly`  
   (Internal; e.g. for reports.)
4. **Product ID:** `com.app.vibly.premium.yearly`  
   **Must be exactly this.** No spaces, same spelling.
5. **Subscription Group:** the one you created (e.g. `Vibly Premium`).
6. **Subscription Duration:** 1 Year.
7. **Subscription Prices:**  
   - Click **Add Subscription Price**.  
   - Choose a price (e.g. **$39.99** or your preferred tier).  
   - Set the start date (e.g. today).
8. **Localizations** (at least one language, e.g. English):
   - **Display Name:** `Vibly Premium (Yearly)`
   - **Description:**  
     `Full access for you and your partner: daily questions, mood tracking, live distance, weekly sync reports, and more. Billed annually.`
9. **Review Notes** (optional): e.g. `Premium yearly subscription for couples.`
10. Save and submit for review (with your app version when you’re ready).

### 2.4 Create the Monthly subscription

1. In the same subscription group, click **+** again to add another subscription.
2. **Type:** **Auto-Renewable Subscription**.
3. **Reference Name:** `Vibly Premium Monthly`
4. **Product ID:** `com.app.vibly.premium.monthly`  
   **Exactly this.**
5. **Subscription Group:** same as yearly (e.g. `Vibly Premium`).
6. **Subscription Duration:** 1 Month.
7. **Subscription Prices:**  
   - Add price (e.g. **$12.99** or your preferred tier).
8. **Localizations** (e.g. English):
   - **Display Name:** `Vibly Premium (Monthly)`
   - **Description:**  
     `Full access for you and your partner: daily questions, mood tracking, live distance, weekly sync reports. Billed monthly.`
9. Save and submit for review.

---

## 3. Content to copy into App Store Connect

Use these exactly or adjust wording to fit your app.

### Yearly product

- **Product ID:** `com.app.vibly.premium.yearly`
- **Reference Name:** `Vibly Premium Yearly`
- **Display Name (customer-facing):** `Vibly Premium (Yearly)`
- **Description:**  
  `Full access for you and your partner: daily questions, mood tracking, live distance, weekly sync reports, and more. Billed annually.`

### Monthly product

- **Product ID:** `com.app.vibly.premium.monthly`
- **Reference Name:** `Vibly Premium Monthly`
- **Display Name (customer-facing):** `Vibly Premium (Monthly)`
- **Description:**  
  `Full access for you and your partner: daily questions, mood tracking, live distance, weekly sync reports. Billed monthly.`

---

## 4. Optional: Introductory offer or free trial

If you want a free trial or introductory price:

1. In each subscription’s page in App Store Connect, find **Introductory Offers** or **Subscription Prices**.
2. Add an **Introductory Offer**:
   - Type: e.g. **Free** for 1 week, or **Pay as you go** for a reduced price.
   - Duration: e.g. 1 week, 1 month.
3. The app will show Apple’s standard subscription sheet; Apple will display the offer you set here.

---

## 5. After creating products

1. **Xcode:** Ensure the **App** target has **In-App Purchase** capability (Signing & Capabilities → + Capability → In-App Purchase).
2. **App:** In the project root `.env`, use real IAP:  
   `VITE_IAP_TEST_MODE=false`
3. **Build and run:**  
   `npm run build:ios` then run from Xcode on a real device (or simulator with StoreKit testing).
4. **Testing:** Use a **Sandbox** Apple ID (Users and Access → Sandbox → Testers) to test real purchase flow without being charged.

---

## 6. Flow summary

| Step | Where | What |
|------|--------|------|
| 1 | App Store Connect | Create subscription group (e.g. `Vibly Premium`). |
| 2 | App Store Connect | Create subscription with ID `com.app.vibly.premium.yearly` (yearly). |
| 3 | App Store Connect | Create subscription with ID `com.app.vibly.premium.monthly` (monthly). |
| 4 | App Store Connect | Add localizations (display name + description) for each. |
| 5 | Xcode | Add In-App Purchase capability to the App target. |
| 6 | .env | `VITE_IAP_TEST_MODE=false`. |
| 7 | Build | `npm run build:ios` and run the app. |

The app is already wired to these product IDs; once the products exist in App Store Connect and the capability is enabled, the paywall **Continue** button will trigger the real Apple purchase sheet.
