
-- Fix: Drop all restrictive SELECT policies on profiles and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read partner profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can read partner profile"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT CASE WHEN user_a = auth.uid() THEN user_b ELSE user_a END
      FROM public.couples
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );

-- Also fix couples SELECT policy (same issue - was restrictive)
DROP POLICY IF EXISTS "Users can read own couple" ON public.couples;
CREATE POLICY "Users can read own couple"
  ON public.couples FOR SELECT
  USING (user_a = auth.uid() OR user_b = auth.uid());

-- Fix answers SELECT policy
DROP POLICY IF EXISTS "Users can read answers in their couple" ON public.answers;
CREATE POLICY "Users can read answers in their couple"
  ON public.answers FOR SELECT
  USING (
    couple_id IN (
      SELECT couple_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Fix couples INSERT policy
DROP POLICY IF EXISTS "Users can insert couple" ON public.couples;
CREATE POLICY "Users can insert couple"
  ON public.couples FOR INSERT
  WITH CHECK (user_a = auth.uid() OR user_b = auth.uid());

-- Fix answers INSERT policy
DROP POLICY IF EXISTS "Users can insert own answers" ON public.answers;
CREATE POLICY "Users can insert own answers"
  ON public.answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Fix profiles INSERT/UPDATE (recreate as permissive)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
