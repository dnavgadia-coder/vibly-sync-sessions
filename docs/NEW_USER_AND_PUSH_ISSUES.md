# What’s Actually Going Wrong (New User + Push)

## 1. New user: “no UUID / details not created / login not working”

### Cause 1: Profile created **after** sign-up (race)

- Sign-up inserts a row into `auth.users`.
- A DB trigger `handle_new_user()` runs **after** that insert and creates a row in `public.profiles` with the same `id`, plus `invite_code`, etc.
- The app **does not wait** for that. It navigates to `/name` right after `signUp()`.
- So for a short time the user is on `/name` but **no profile row exists yet**. When they tap “Continue” and you run:

  `supabase.from('profiles').update({ name }).eq('id', user.id)`

  the update affects **0 rows** (no row with that `id` yet). No error, but the name is never saved. Later screens expect a profile and can break or show empty data.

So the real issue is: **profile might not exist yet when we first use it.**

### Cause 2: Email confirmation (if enabled in Supabase)

- If “Confirm email” is on, `signUp()` does **not** set a session immediately.
- The client then navigates to `/name` with **no user** in `useAuth()`.
- `SilentAuthGate` sees no user and calls `ensureDeviceAccount()`, which creates a **device** account and signs in with that.
- Result: the new **email** user never gets used; the app is “logged in” as a different (device) user. That looks like “login not working” or “wrong user.”

### Cause 3: EntryRoute when profile is missing

- EntryRoute loads the profile and then redirects to `/home` or `/name`.
- If the profile doesn’t exist yet (trigger delay), `prof` is null and you go to `/name`. That part is fine.
- The bug is only when **on `/name`** we do `update(profiles)` before the profile row exists, so the name is lost.

---

## 2. Push: “FCM token not updated in profile” / “registration taking too long”

### Cause 1: Token sent before the WebView is ready

- On iOS, Firebase gets the FCM token and your `AppDelegate` calls `bridge.triggerWindowJSEvent('CapacitorFCMTokenReceived', …)`.
- If the WebView isn’t ready yet (e.g. cold start), the system log can show:  
  `WebPage::runJavaScriptInFrameInScriptWorld: Request to run JavaScript failed`  
  So the event **never runs in JS** and the token is never stored or sent to Supabase.
- You added a retry (`trySendLastFcmTokenToJS` after 1s). That helps only once the bridge is ready.

### Cause 2: Listener attached after the event

- If the native side sends the token **before** the JS listener for `CapacitorFCMTokenReceived` is attached, the event is missed.
- You added `localStorage` caching and polling so the permission screen can still pick up the token if the manager saved it earlier.

### Cause 3: RLS / auth when saving the token

- Updating `profiles.fcm_token` is allowed only for the row where `id = auth.uid()`.
- If the session isn’t set yet (e.g. right after cold start) or is a different user, the update affects 0 rows. You then see “Could not update profile (RLS/auth)” or the token simply doesn’t persist.

---

## Fixes applied in code

1. **New user**
   - After `signUp()`, **wait for the profile row to exist** (short poll) before navigating to `/name`, so the profile is there when the user taps Continue.
   - On **NameInputScreen**, if the profile update affects 0 rows (profile didn’t exist yet), **create the profile** with an upsert or insert so the name is not lost and “new user” flow works.

2. **Push**
   - Rely on native retries and JS polling/cache so the token is delivered once the bridge/listener are ready.
   - Ensure the **session is ready** before saving the token (you already check `getUser()` in the registration flow). If you still see RLS errors, the fix is to run the “save token” logic only when `auth.getUser()` returns the same user you’re updating.

This doc summarizes the **actual** causes; the code changes implement the fixes above.
