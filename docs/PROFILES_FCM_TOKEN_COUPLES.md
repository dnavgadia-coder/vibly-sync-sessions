# profiles.fcm_token and couples

## What the CSV shows

- **profiles** has one row per **user** (one per account). Each row has **partner_id** / **couple_id** when the user is in a couple.
- The **fcm_token** column is **per user** (per row). It is the push token for **that user’s device**.
- In your export, most **fcm_token** values are **empty (null)**. A few rows have a **64-character hex** value — that is an **APNs device token**, not an FCM token, and must not be used for sending push via FCM.

So: one profile row = one person = one device. Each row should get its **own** FCM token when that person allows notifications on **their** device.

---

## Both users in a couple need their own token

- **User A** and **User B** in a couple are two different **profile** rows.
- To get push on **both** phones:
  - **User A** opens the app on **their** phone → taps **Allow Notifications** → their **fcm_token** is saved in **User A’s** row.
  - **User B** opens the app on **their** phone → taps **Allow Notifications** → their **fcm_token** is saved in **User B’s** row.
- We do **not** store “one token per couple”. We store **one token per user** (per profile row). So **both** users in a couple must allow notifications on their **own** device; then both rows will have **fcm_token** set and both will receive push.

---

## Why fcm_token was still null

1. **Only FCM tokens are saved**  
   If the app ever received a 64-char hex (APNs) token and saved it, the new logic **no longer saves** that. We only save tokens that look like **FCM** (long, not only hex). So old APNs values in the DB should be cleared; new saves will only be valid FCM tokens.

2. **Token can arrive before the user is loaded**  
   On iOS the FCM token can be sent from native very early. If at that moment the app didn’t have the logged-in **user** yet, the save was skipped. The app now keeps a **pending** token and saves it as soon as **user** is available, so we don’t lose the token.

3. **Each user must allow on their own device**  
   If only one person in a couple ever allowed notifications, only that profile row would have a token. The other row stays null until that person opens the app and allows notifications on their device.

---

## What was changed in code

- **usePushNotificationManager**
  - **Save helper** that only saves if the token is **not** 64-char hex (so we never store APNs as fcm_token).
  - When we receive the token on iOS, we store it in a **ref** and save when **user.id** is available (handles “token before user”).
- **usePushRegistration**
  - When the user taps “Allow Notifications” on iOS, we **reject** 64-char hex and only save tokens that look like FCM, and show a clear error if we get APNs.
- **send-push** Edge Function (already in place)
  - Detects 64-char hex in **profiles.fcm_token** and returns an error instead of sending to FCM.

---

## What you should do

1. **Clear wrong tokens in the database**  
   In Supabase **profiles**, set **fcm_token** to **empty (NULL)** for any row where the value is exactly 64 hexadecimal characters.

2. **Have each user re-allow notifications**  
   Each user (including both in a couple) should:
   - Open the app on **their own** device.
   - Go to the Notifications screen (or use the home banner).
   - Tap **Allow Notifications** and accept the system dialog.
   - After that, their profile row should get a **long** FCM token (150+ characters) in **fcm_token**.

3. **Check the table again**  
   Export or look at **profiles**: each row that allowed notifications should have **fcm_token** filled with a long string, not 64 hex and not null. Both users in a couple will have a token only if **both** did this on their own devices.
