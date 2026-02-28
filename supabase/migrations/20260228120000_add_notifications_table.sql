-- Notifications table for in-app notifications (Lovable / Supabase)
-- Run this in Supabase SQL Editor or via Lovable if you use migrations from the dashboard.

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  read_at timestamptz,
  data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (mark read)"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow insert for own user (for system/backend); in practice you may create notifs from client for partner via service role or a function
CREATE POLICY "Users can insert notifications for self"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: allow partner to create notification for user (e.g. "Your partner answered")
-- We use a policy that allows insert if the inserter is the partner of user_id
CREATE POLICY "Partner can create notification for user"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_id AND p.partner_id = auth.uid()
    )
  );

COMMENT ON TABLE public.notifications IS 'In-app notifications for Vibly (partner answered, streak, weekly card, etc.)';

-- Enable realtime for live notification updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
