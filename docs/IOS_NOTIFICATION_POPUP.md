# iOS: Notification permission popup not showing

## Firebase "swizzling" message

If you see in the Xcode console:

```
[FirebaseMessaging][I-FCM001000] FIRMessaging Remote Notifications proxy enabled, will swizzle...
```

The app is now configured so this is **disabled**. In **Info.plist** the key **FirebaseAppDelegateProxyEnabled** is set to **NO**. That means:

- Firebase does **not** swizzle (replace) your app delegate methods.
- Your **AppDelegate** manually passes the APNs device token to Firebase in `application(_:didRegisterForRemoteNotificationsWithDeviceToken:)`.
- You can ignore the Firebase swizzling message, or it may no longer appear after a clean build.

Rebuild the app (Product → Clean Build Folder, then Build) so the updated Info.plist is used.

---

## System permission popup still not showing

The **system** dialog ("Vibly Would Like to Send You Notifications") appears when the app calls the iOS permission API. That happens when the user taps **"Allow Notifications"** in your app (on the Notifications screen or the home screen banner).

If the popup never appears:

1. **Use a real device**  
   The permission dialog is unreliable on the **iOS Simulator**. Use a physical iPhone.

2. **Tap the in-app button**  
   Open the **Notifications** screen (or the home screen and find the notification banner), then tap **"Allow Notifications"**. The system dialog is shown at that moment.

3. **Permission was already denied**  
   If the user previously tapped **"Don't Allow"**, iOS will **not** show the dialog again. Options:
   - **Settings → Vibly → Notifications** → turn **Allow Notifications** on.
   - Or delete the app and reinstall to get the permission dialog again.

4. **Push capability in Xcode**  
   Ensure the app has **Push Notifications** capability: Xcode → App target → **Signing & Capabilities** → **+ Capability** → **Push Notifications**.

5. **Run in Debug on device**  
   Build and run on a real device (not Simulator) with the device selected in the scheme. The first time you tap "Allow Notifications" in the app, the system dialog should appear.
