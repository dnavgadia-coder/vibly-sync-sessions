# FCM Service Account Setup (HTTP v1 API)

The **send-push** Edge Function uses the **Firebase Cloud Messaging HTTP v1 API** with a **Service Account**. This is the recommended approach; the old "Cloud Messaging API (Legacy)" Server Key is deprecated.

You need **three Supabase secrets** — all come from one JSON file you download from Firebase.

---

## Step 1 — Create or use a Service Account in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) and select your project (e.g. **vibly-d4217**).
2. Click the **gear icon** → **Project settings**.
3. Open the **Service accounts** tab.
4. You’ll see a default **Firebase Admin SDK** service account (e.g. `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`).
5. Click **Generate new private key** → **Generate key**.  
   A JSON file will download (e.g. `your-project-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`).  
   **Keep this file private** — it grants access to your project.

---

## Step 2 — Get the three values from the JSON file

Open the downloaded JSON. It looks like this (with different values):

```json
{
  "type": "service_account",
  "project_id": "vibly-d4217",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@vibly-d4217.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

You only need these three:

| Supabase secret name   | Value in JSON   | Example |
|------------------------|-----------------|--------|
| **FCM_PROJECT_ID**     | `project_id`    | `vibly-d4217` |
| **FCM_CLIENT_EMAIL**   | `client_email`  | `firebase-adminsdk-xxxxx@vibly-d4217.iam.gserviceaccount.com` |
| **FCM_PRIVATE_KEY**    | `private_key`   | The full string including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` |

For **FCM_PRIVATE_KEY**:

- The value in the JSON has real newlines (`\n` in the file are actual line breaks).
- When pasting into Supabase:
  - **Option A:** Paste the key as-is if Supabase allows multiline (some UIs do).
  - **Option B:** Paste on one line and keep the literal characters `\n` where the line breaks were. The Edge Function will turn `\n` back into newlines.

So you can copy `private_key` and, if needed, replace each real newline with the two characters `\n`.

---

## Step 3 — Add the secrets in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Settings** → **Edge Functions**.
3. Under **Secrets**, add three entries:

| Name               | Value |
|--------------------|--------|
| **FCM_PROJECT_ID** | Paste the `project_id` from the JSON (e.g. `vibly-d4217`). |
| **FCM_CLIENT_EMAIL** | Paste the `client_email` from the JSON. |
| **FCM_PRIVATE_KEY** | Paste the `private_key` from the JSON (see note above about newlines). |

4. Save each secret.

---

## Step 4 — Remove the old secret (if you used it)

If you previously used the legacy Server Key:

- You can delete the **FCM_SERVER_KEY** secret. The new code does not use it.

---

## Summary

| Old (Legacy)        | New (HTTP v1)                          |
|--------------------|----------------------------------------|
| Single **FCM_SERVER_KEY** | **FCM_PROJECT_ID** + **FCM_CLIENT_EMAIL** + **FCM_PRIVATE_KEY** |
| From: Cloud Messaging → Server key | From: Project settings → Service accounts → Generate new private key → use the JSON |

All three new values come from the **same** Service Account JSON file. No need to enable or use the “Cloud Messaging API (Legacy)” or its Server Key.
