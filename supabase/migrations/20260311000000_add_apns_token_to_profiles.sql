-- Store APNs device token separately so fcm_token is never overwritten with APNs.
-- send-push Edge Function uses only fcm_token (FCM); apns_token is for reference/debug.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS apns_token TEXT;
