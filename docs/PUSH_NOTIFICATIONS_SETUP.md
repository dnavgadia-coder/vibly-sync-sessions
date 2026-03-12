# Push Notifications Setup (Vibly)

In-app notifications are stored in the database and shown in the Notifications screen. To **deliver push notifications** to the device (when the app is in the background), follow these steps.

## 1. iOS (Xcode)

1. Open the app in **Xcode**.
2. Select the **App** target → **Signing & Capabilities** → **+ Capability** → add **Push Notifications**.
3. In `App/App/AppDelegate.swift`, add (if not already present):

```swift
import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
}
```

4. Build and run the app. When the user taps **Allow Notifications** on the Notifications screen, the device token is saved to `profiles.fcm_token`.

## 2. Android

- Add your Firebase `google-services.json` to the Android app (e.g. `android/app/`) and configure FCM if needed. The Capacitor Push Notifications plugin uses FCM on Android.
- When the user allows notifications, the FCM token is saved to `profiles.fcm_token`.

## 3. Backend: send push when a notification is created

The app **calls the `send-push` Edge Function** after every in-app notification is created (partner answered, mood, couple close, partner joined). So you only need to deploy the function and set the FCM key.

### Deploy the Edge Function and set secrets

1. Deploy the function:
   ```bash
   supabase functions deploy send-push
   ```

2. Set the FCM server key (Firebase Console → Project Settings → Cloud Messaging → **Server key**):
   ```bash
   supabase secrets set FCM_SERVER_KEY=your_server_key_here
   ```

3. For **Production FCM** (recommended), use the **Firebase Admin SDK** and set:
   - `FCM_PROJECT_ID`
   - `FCM_CLIENT_EMAIL`
   - `FCM_PRIVATE_KEY`
   (The current `send-push` function uses the legacy `FCM_SERVER_KEY` for simplicity; you can switch it to the HTTP v1 API with a service account.)

### iOS note

- On **iOS**, Capacitor provides the **APNs** token. The legacy FCM key only works for **Android** FCM tokens.
- To send to **iOS** you can: (1) Add Firebase to the iOS app and use FCM for iOS (then the token in `fcm_token` is an FCM token that works with FCM), or (2) Use a separate APNs sender (e.g. with a .p8 key) in the Edge Function for tokens that look like APNs tokens.

## 4. Sync and run

```bash
npm run build:ios
npx cap sync ios
```

Then open in Xcode and run on a device (push does not work in the simulator).

## Summary

| Step | What it does |
|------|----------------|
| User taps **Allow Notifications** | App requests permission, registers with APNs (iOS) or FCM (Android), and saves the device token to `profiles.fcm_token`. |
| App creates a notification row | e.g. Partner answered, mood update, couple close, partner joined. |
| Database webhook fires | Supabase calls the `send-push` Edge Function with the new row. |
| Edge Function | Reads `profiles.fcm_token` for that user and sends the push via FCM (or APNs for iOS if configured). |

If you don’t set up the webhook and FCM secrets, the user will still see **in-app** notifications in the Notifications screen; only **push** (lock screen / banner) requires the backend steps above.
