# After the FCM token is sent to JS successfully

Once **triggerWindowJSEvent** delivers the FCM token to the app, the JavaScript layer does two things:

1. **usePushNotificationManager** (global): Listens for `CapacitorFCMTokenReceived`, then saves the token to **Supabase** with:
   ```ts
   await supabase.from("profiles").update({ fcm_token: token }).eq("id", user.id);
   ```
2. **usePushRegistration** (when user taps "Allow Notifications"): Same event → same save → then resolves so the UI can show "Notifications enabled" and navigate.

So the token is stored in **`profiles.fcm_token`** for the current user. What to do next:

---

## 1. Confirm the token is in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Table Editor** → **profiles**.
3. Find the row for the user who allowed notifications (match by `id` = auth user id).
4. Check the **fcm_token** column — it should contain a long string (the FCM registration token).  
   If it’s empty, the event may have fired before the user was logged in, or the listener didn’t run; try allowing notifications again once logged in.

---

## 2. Ensure the Edge Function can send pushes

The **send-push** Edge Function reads `profiles.fcm_token` and sends via the FCM HTTP v1 API. It needs these **Secrets** (see **FCM_SERVICE_ACCOUNT_SETUP.md**):

| Secret              | Description                          |
|---------------------|--------------------------------------|
| **FCM_PROJECT_ID**  | Firebase project ID                  |
| **FCM_CLIENT_EMAIL**| Service account `client_email`      |
| **FCM_PRIVATE_KEY** | Service account `private_key`        |

Supabase: **Settings → Edge Functions → Secrets**. Add them if they’re missing, then redeploy or wait for the next deploy so the function uses the new secrets.

---

## 3. Test sending a push notification

**Option A – From the app (real flow)**  
- Use two accounts (or two devices): User A and User B.  
- User B allows notifications so their **fcm_token** is saved (as above).  
- User A does something that notifies User B (e.g. answers the daily question, or connects as partner).  
- User B’s device should receive a push (in background or foreground).

**Option B – Manual HTTP call to the Edge Function**  
- Get User B’s user id (from Supabase **profiles** or **auth.users**).  
- Call your Edge Function with a tool like curl (use your Supabase URL and anon or service key as needed by your function):

  ```bash
  curl -X POST 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/send-push' \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer <YOUR_ANON_OR_SERVICE_KEY>' \
    -d '{"user_id":"<USER_B_UUID>","title":"Test","body":"Hello from send-push"}'
  ```

  Replace `<YOUR_PROJECT_REF>`, `<YOUR_ANON_OR_SERVICE_KEY>`, and `<USER_B_UUID>`.  
- User B’s device should get the notification if **fcm_token** is set and the function secrets are correct.

---

## 4. Optional: Improve UX when the token is saved

- On the **Notifications** screen, after the user taps "Allow Notifications", the app already navigates to `/home` and can show a success toast.  
- You can also refresh profile or set local state when **CapacitorFCMTokenReceived** fires (e.g. “Notifications enabled” badge or a one-time message) so the user sees that the token was received and stored.

---

## Summary

| Step | Action |
|------|--------|
| 1 | In Supabase **profiles**, confirm **fcm_token** is set for the test user. |
| 2 | In Supabase **Edge Functions → Secrets**, set **FCM_PROJECT_ID**, **FCM_CLIENT_EMAIL**, **FCM_PRIVATE_KEY** (see FCM_SERVICE_ACCOUNT_SETUP.md). |
| 3 | Test: trigger a notification from the app (e.g. partner answers question) or via a manual **send-push** HTTP call. |
| 4 | (Optional) Add UI feedback when the token is received/saved. |

After that, the flow is: **App sends token to JS → JS saves to `profiles.fcm_token` → send-push reads it and sends via FCM → device receives the notification.**
