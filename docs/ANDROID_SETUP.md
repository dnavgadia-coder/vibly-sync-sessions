# Android Project Setup Guide

This document covers everything needed to get the Vibly Android project running in Android Studio and publishing to Google Play.

---

## Prerequisites

- Android Studio (latest stable — Hedgehog or newer)
- Java 21 (matches `JavaVersion.VERSION_21` in `capacitor.build.gradle`)
- A Firebase project (same one used for iOS if applicable)
- A Google Play Console account (for IAP)

---

## Step 1: Open the Project in Android Studio

1. Open Android Studio
2. Click **Open** and select the `android/` folder inside this project:
   ```
   /path/to/vibly-sync-sessions/android
   ```
3. Let Gradle sync complete (it will download all dependencies automatically)

---

## Step 2: Firebase Setup (Push Notifications)

Push notifications on Android require Firebase Cloud Messaging (FCM).

### 2a. Create / Use Existing Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Open your project (or create one named `Vibly`)
3. Click **Add app** → Choose **Android**
4. Enter package name: `com.app.vibly`
5. Download `google-services.json`

### 2b. Place the config file

```
android/app/google-services.json
```

> The `android/app/build.gradle` already auto-applies the `google-services` plugin when this file is present. No manual gradle edits needed.

### 2c. Get the FCM Server Key

1. In Firebase Console → Project Settings → Cloud Messaging
2. Copy the **Server Key** (legacy) or set up a Service Account (v1 API)
3. Add it to your Supabase project secrets:
   - Supabase Dashboard → Settings → Edge Functions → Secrets
   - Key: `FCM_SERVER_KEY`, Value: your FCM server key

---

## Step 3: In-App Purchases (Google Play Billing)

The `cordova-plugin-purchase` is already installed and the `com.android.billingclient:billing:8.3.0` dependency is automatically included via `capacitor.build.gradle`.

To fully enable IAP:

1. Create your app in [Google Play Console](https://play.google.com/console)
2. Set up your subscription/product IDs under **Monetize → Products**
3. Upload a signed APK or AAB (at least once to activate billing)
4. Products must match the IDs used in the app's JavaScript code

---

## Step 4: Build the App

### Development build (from terminal)

```bash
npm run build:android
```

This runs `vite build && npx cap sync android` — builds the web app and copies assets + plugins to the Android project.

### Open in Android Studio

```bash
npx cap open android
```

Then use the **Run** button (▶) to launch on a device or emulator.

---

## Step 5: Permissions Already Configured

The following permissions are set in `AndroidManifest.xml`:

| Permission | Purpose |
|---|---|
| `INTERNET` | Core web app networking |
| `ACCESS_NETWORK_STATE` | Network availability checks |
| `POST_NOTIFICATIONS` | Push notifications (Android 13+) |
| `RECEIVE_BOOT_COMPLETED` | Re-register push after reboot |
| `VIBRATE` | Notification vibration |
| `ACCESS_FINE_LOCATION` | Precise location (partner distance) |
| `ACCESS_COARSE_LOCATION` | Approximate location fallback |
| `ACCESS_BACKGROUND_LOCATION` | Background location updates |
| `com.android.vending.BILLING` | Google Play In-App Purchases |

---

## Step 6: App Icon & Splash Screen

Default Capacitor icons are placed in `android/app/src/main/res/mipmap-*/`.

To use the Vibly icon:
1. Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) or Android Studio's **Image Asset** tool
2. Replace all `ic_launcher.png` and `ic_launcher_round.png` files in:
   - `mipmap-hdpi`, `mipmap-mdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`

Splash screen images are in:
- `android/app/src/main/res/drawable*/splash.png`

---

## Step 7: Signing for Release

1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore vibly-release.keystore -alias vibly -keyalg RSA -keysize 2048 -validity 10000
   ```
2. In `android/app/build.gradle`, add a `signingConfigs` block and reference it in `buildTypes.release`
3. Build a signed AAB:
   - Android Studio → **Build → Generate Signed Bundle/APK**

---

## Workflow After Code Changes

Whenever you change the web app (React code):

```bash
npm run build:android
npx cap open android
```

Then build/run from Android Studio.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Gradle sync fails | Check Java version is 21, run `./gradlew --version` in `android/` |
| Push not working | Verify `google-services.json` is at `android/app/`, check `FCM_SERVER_KEY` in Supabase |
| IAP not working | Ensure app is published in Play Console with at least one APK, products are active |
| White screen | Run `npm run build:android` again to sync latest web assets |
| Location permission denied | The app requests location at runtime; make sure the JS code calls `Geolocation.requestPermissions()` |
