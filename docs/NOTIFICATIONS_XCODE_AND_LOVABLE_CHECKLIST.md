# Notifications: Xcode + Lovable Cloud Checklist

Use this to verify push notifications are fully set up and to see what to do in Lovable (Supabase) cloud.

---

## Part 1: Xcode (iOS) – Push notification steps

### Already done in this project

| Item | Status | Location |
|------|--------|----------|
| AppDelegate push handlers | Done | `ios/App/App/AppDelegate.swift` – `didRegisterForRemoteNotificationsWithDeviceToken` and `didFailToRegisterForRemoteNotificationsWithError` |
| `aps-environment` entitlement | Done | `ios/App/App/App.entitlements` – `aps-environment` = `development` |
| Capacitor Push plugin in iOS | Done | `CapApp-SPM/Package.swift` – CapacitorPushNotifications included |
| Capacitor config for push | Done | `capacitor.config.ts` – `PushNotifications.presentationOptions` |

### You must do / verify in Xcode

1. **Add Push Notifications capability**
   - Open the app in **Xcode**.
   - Select the **App** target (not the project).
   - Go to **Signing & Capabilities**.
   - Click **+ Capability** and add **Push Notifications**.
   - If it’s already there, leave it. This is what creates/updates the `aps-environment` entitlement.

2. **`aps-environment` for release**
   - In **App.entitlements** you currently have:
     - `aps-environment` = `development` (correct for running from Xcode on a device).
   - For **Archive / App Store / TestFlight**, Xcode usually switches this to **production** when you use a distribution profile. If you ever edit entitlements by hand, use:
     - **development** → run from Xcode on device.
     - **production** → Archive, TestFlight, App Store.

3. **Run on a real device**
   - Push does **not** work in the iOS Simulator.
   - Build and run on a **physical iPhone** (USB or wireless).

4. **Apple Developer**
   - The App ID must have **Push Notifications** enabled in [Apple Developer → Identifiers → your App ID → Edit](https://developer.apple.com/account/resources/identifiers/list).
   - If you use a new App ID, regenerate the provisioning profile after enabling Push.

### Quick Xcode checklist

- [ ] App target has capability **Push Notifications** (Signing & Capabilities).
- [ ] Running on a **real device**, not Simulator.
- [ ] App ID has Push Notifications enabled in Apple Developer portal (if you manage it manually).

---

## Part 2: Lovable cloud (Supabase / backend) – Notification steps

Lovable uses Supabase as the database. All in-app notification data lives in Supabase; push delivery needs the Edge Function and secrets below.

### 1. Database (Supabase) – already in project

| Item | Status | Notes |
|------|--------|--------|
| `public.notifications` table | Migration in repo | Run migration if not already applied in Lovable/Supabase. |
| `public.profiles.fcm_token` | In schema | Used to store device token for push. |
| Realtime on `notifications` | In migration | So the app can live-update the notification list. |

**In Lovable / Supabase:**

- Open your project’s **Supabase** (or Lovable’s database view).
- **SQL Editor**: run the migration that creates `notifications` (and enables realtime) if you haven’t already.
- No code changes needed for the table; the app already uses it.

### 2. Edge Function: send push (Supabase)

The app calls the **`send-push`** Edge Function whenever it creates an in-app notification (partner answered, mood, couple close, partner joined). The function reads `profiles.fcm_token` and sends the push via FCM (and optionally APNs for iOS).

**In Lovable / Supabase (or Supabase Dashboard):**

1. **Deploy the Edge Function**
   - Function code: `supabase/functions/send-push/index.ts`.
   - Deploy (CLI or Lovable’s Supabase integration):
     ```bash
     supabase functions deploy send-push
     ```

2. **Set secrets** (so the function can call FCM)
   - **FCM_SERVER_KEY** (legacy key, easiest for Android):
     - Firebase Console → Project Settings → Cloud Messaging → **Server key**.
     - In Supabase: **Project Settings → Edge Functions → Secrets** (or CLI):
       ```bash
       supabase secrets set FCM_SERVER_KEY=your_server_key_here
       ```
   - This is enough for **Android** push. For **iOS**, the app currently stores the **APNs** token in `fcm_token`; the legacy FCM key does **not** send to that. So either:
     - Use Firebase for iOS as well and store an FCM token in `fcm_token`, or  
     - Add APNs sending in the Edge Function (e.g. with a .p8 key and an APNs library).

3. **No Database Webhook required**
   - The app already invokes `send-push` from the client after inserting a row into `notifications`. You do **not** need to create a Database Webhook in Lovable/Supabase for push to be triggered.

### 3. Optional: Database Webhook (alternative to client invoke)

If you prefer to trigger push from the database instead of the client:

- In **Supabase Dashboard** → **Database** → **Webhooks** (or equivalent in Lovable).
- Create a webhook:
  - **Table:** `public.notifications`
  - **Events:** Insert
  - **Type:** Invoke Edge Function → **send-push**
- Then the function will be called with the new row; you can still keep or remove the client-side `invoke('send-push', …)`.

### 4. RLS / security

- The `notifications` table has RLS so users only see their own rows.
- The `send-push` function uses the **service role** to read `profiles.fcm_token`; no extra RLS change needed for that.

### Lovable cloud checklist

- [ ] Migration for `notifications` (and realtime) applied in Supabase.
- [ ] Edge Function **send-push** deployed.
- [ ] Secret **FCM_SERVER_KEY** set (for Android push).
- [ ] (Optional) For iOS push: either add Firebase for iOS and use FCM token, or add APNs sending in the function.

---

## Summary

| Where | What to do |
|-------|------------|
| **Xcode** | Add/verify **Push Notifications** capability, run on **real device**, ensure App ID has Push enabled if needed. |
| **Lovable / Supabase** | Apply `notifications` migration, deploy **send-push** Edge Function, set **FCM_SERVER_KEY** (and optionally configure iOS/APNs). |

No code changes are required for the checklist; these are configuration and deployment steps in Xcode and in the Lovable/Supabase project.
