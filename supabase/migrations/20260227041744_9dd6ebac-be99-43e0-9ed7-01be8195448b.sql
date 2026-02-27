
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read partner profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can read partner profile" ON public.profiles FOR SELECT USING (
  id IN (
    SELECT CASE WHEN couples.user_a = auth.uid() THEN couples.user_b ELSE couples.user_a END
    FROM couples WHERE couples.user_a = auth.uid() OR couples.user_b = auth.uid()
  )
);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
