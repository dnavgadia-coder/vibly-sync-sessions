# Push Notifications – What’s Done vs What You Do

## ✅ Done in this project (no action needed)

| Step | Status | Where |
|------|--------|--------|
| **Store FCM tokens** | Done | `profiles.fcm_token` is in Supabase types; `usePushRegistration.ts` saves the device token to `profiles.fcm_token` when the user allows notifications. |
| **Edge function for FCM** | Done | `supabase/functions/send-push/index.ts` – sends push via FCM HTTP API. Deploy it from Lovable/Supabase. |
| **NotificationScreen uses Capacitor push** | Done | `NotificationScreen` uses `usePushRegistration()` which uses `@capacitor/push-notifications` on native (not the browser `Notification` API for registration). On web it still uses `Notification.requestPermission()` as fallback. |
| **Install @capacitor/push-notifications** | Done | In `package.json` as `"@capacitor/push-notifications": "^8.0.1"`. |
| **npx cap sync** | Run when needed | Use after adding Firebase config files or after `npm install`. See “Run npx cap sync” below. |

---

## What you do in Lovable (cloud)

| Step | Action |
|------|--------|
| **Store FCM server key as secret** | In Lovable/Supabase: **Project Settings → Edge Functions → Secrets** (or Supabase Dashboard). Add secret **FCM_SERVER_KEY** = your Firebase Cloud Messaging **Server key** (from Firebase Console → Project Settings → Cloud Messaging). |
| **Deploy send-push Edge Function** | Deploy `supabase/functions/send-push` to Lovable Cloud / Supabase (e.g. from Lovable’s Supabase integration or CLI: `supabase functions deploy send-push`). |

---

## What you do locally (Firebase + Capacitor)

### 1. Set up Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create or select a project.
2. Add an **Android** app with package name **com.app.vibly** (or your actual Android package name from `android/app/build.gradle`).
3. Add an **iOS** app with bundle ID **com.app.vibly** (or your actual bundle ID from Xcode).
4. Download the config files:
   - **Android:** `google-services.json`
   - **iOS:** `GoogleService-Info.plist`

### 2. Add config files to the project

Put the files in these exact locations (create folders if needed):

| Platform | File | Path (from project root) |
|----------|------|---------------------------|
| Android | `google-services.json` | **`android/app/google-services.json`** |
| iOS | `GoogleService-Info.plist` | **`ios/App/App/GoogleService-Info.plist`** |

- **Android:** place `google-services.json` inside `android/app/`.
- **iOS:** place `GoogleService-Info.plist` inside `ios/App/App/` (same level as `Info.plist`).

### 3. Run npx cap sync

After adding the Firebase files (or after any `npm install` that touches native deps), run:

```bash
npx cap sync
```

Or for iOS only:

```bash
npx cap sync ios
```

---

## Optional: .gitignore for Firebase config

If you don’t want to commit Firebase config (they can contain project IDs and keys), add to `.gitignore`:

```
# Firebase config (optional – uncomment if you don’t commit these)
# android/app/google-services.json
# ios/App/App/GoogleService-Info.plist
```

Only uncomment if you intend to keep these files out of version control.

---

## Summary

- **In the repo:** FCM token storage, Edge Function code, NotificationScreen using Capacitor push, and `@capacitor/push-notifications` are already in place.
- **You in Lovable:** Set **FCM_SERVER_KEY** secret and deploy the **send-push** Edge Function.
- **You locally:** Create/add Firebase project, add `google-services.json` and `GoogleService-Info.plist` to the paths above, then run **`npx cap sync`**.
