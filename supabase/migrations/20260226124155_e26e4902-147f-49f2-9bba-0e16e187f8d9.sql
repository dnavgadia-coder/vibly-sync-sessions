
-- Fix RESTRICTIVE policies to PERMISSIVE on all tables
-- Drop and recreate profiles SELECT policies as PERMISSIVE
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read partner profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can read partner profile" ON public.profiles FOR SELECT USING (
  id IN (
    SELECT CASE WHEN user_a = auth.uid() THEN user_b ELSE user_a END
    FROM public.couples
    WHERE user_a = auth.uid() OR user_b = auth.uid()
  )
);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Fix couples policies
DROP POLICY IF EXISTS "Users can read own couple" ON public.couples;
DROP POLICY IF EXISTS "Users can insert couple" ON public.couples;

CREATE POLICY "Users can read own couple" ON public.couples FOR SELECT USING (user_a = auth.uid() OR user_b = auth.uid());
CREATE POLICY "Users can insert couple" ON public.couples FOR INSERT WITH CHECK (user_a = auth.uid() OR user_b = auth.uid());
-- Allow updating couple distance
CREATE POLICY "Users can update own couple" ON public.couples FOR UPDATE USING (user_a = auth.uid() OR user_b = auth.uid());

-- Fix answers policies
DROP POLICY IF EXISTS "Users can read answers in their couple" ON public.answers;
DROP POLICY IF EXISTS "Users can insert own answers" ON public.answers;

CREATE POLICY "Users can read answers in their couple" ON public.answers FOR SELECT USING (
  couple_id IN (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can insert own answers" ON public.answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix questions policy
DROP POLICY IF EXISTS "Questions are publicly readable" ON public.questions;
CREATE POLICY "Questions are publicly readable" ON public.questions FOR SELECT USING (true);
