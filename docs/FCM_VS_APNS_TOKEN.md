# FCM token vs APNs token in `profiles.fcm_token`

## What you're seeing

If in the **profiles** table the **fcm_token** column looks like:

- **64 hexadecimal characters**, e.g.  
  `41D0523EB36FDF11E69BA808A59C640A6C16A99C467998B0E834D96FE2E22FC2`

that is **not** an FCM token. It is an **APNs (Apple) device token**.

---

## Difference

| Token type | Typical format | Used by |
|------------|----------------|--------|
| **APNs device token** | 64 hex characters (0-9, A-F) | Apple Push Notification service only. Your backend does **not** send to this directly. |
| **FCM registration token** | Long string (150+ characters), mixed letters/numbers/symbols | Firebase Cloud Messaging. Your **send-push** Edge Function sends to this. |

The **send-push** function uses the **FCM HTTP v1 API**, which expects an **FCM registration token**. If you store the APNs token in `fcm_token`, pushes will not work and the function will report that the stored value is an APNs token, not FCM.

---

## Why this happens on iOS

On iOS, the app gets **two** tokens:

1. **APNs device token** — from the system after the user allows notifications.  
   Capacitor’s push plugin can expose this via the `registration` event (raw device token).

2. **FCM registration token** — from Firebase **after** the app gives Firebase the APNs token.  
   Your **AppDelegate** receives this in `messaging(_:didReceiveRegistrationToken:)` and sends it to the web view with `triggerWindowJSEvent("CapacitorFCMTokenReceived", …)`.

If the app (or an older version) ever saved the token from the **Capacitor registration event** on iOS, it would have saved the **APNs** token. Only the token received via **CapacitorFCMTokenReceived** (from AppDelegate) is the **FCM** token and should be stored.

---

## What to do

1. **Store only the FCM token**  
   Ensure the app saves the token only when it receives **CapacitorFCMTokenReceived** (and on Android, the FCM token from the plugin’s registration event). The current code is set up to do this; the 64‑char value was likely saved by an older flow or a one-off.

2. **Fix existing bad data**  
   - In Supabase, clear the wrong value: set **fcm_token** to empty (NULL) for that user.  
   - On the device, have the user **turn notifications off** for the app (Settings → Vibly → Notifications → Off), then open the app and tap **Allow Notifications** again.  
   - After that, the app should receive the FCM token from Firebase and save it via **CapacitorFCMTokenReceived**; the new value in **profiles.fcm_token** will be long (150+ chars) and not 64 hex.

3. **Check the Edge Function**  
   The **send-push** function now checks for 64‑char hex and returns a clear error if the stored value looks like an APNs token, so you won’t send it to FCM by mistake.

---

## Summary

- **64 hex characters** in **fcm_token** = **APNs device token** → not valid for **send-push**.
- **Long, non‑hex-only string** = **FCM registration token** → correct for **send-push**.
- Clear the wrong value for the user, re-allow notifications on the device, and the app will store the proper FCM token so push works with Lovable’s default database.
