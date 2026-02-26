
-- Fix infinite recursion in RLS: use couples table instead of self-referencing profiles
DROP POLICY IF EXISTS "Users can read partner profile" ON public.profiles;

CREATE POLICY "Users can read partner profile"
  ON public.profiles
  FOR SELECT
  USING (
    id IN (
      SELECT CASE WHEN user_a = auth.uid() THEN user_b ELSE user_a END
      FROM public.couples
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );
