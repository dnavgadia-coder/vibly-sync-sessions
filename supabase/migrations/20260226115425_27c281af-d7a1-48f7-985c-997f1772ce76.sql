
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  partner_name TEXT DEFAULT '',
  start_date DATE,
  partner_id UUID REFERENCES public.profiles(id),
  couple_id TEXT,
  invite_code TEXT UNIQUE,
  invite_code_expires_at TIMESTAMPTZ,
  current_mood TEXT,
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_answered_date DATE,
  subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_updated_at TIMESTAMPTZ,
  fcm_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can read partner profile"
  ON public.profiles FOR SELECT
  USING (
    id = (SELECT partner_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  emoji TEXT DEFAULT '💬',
  options JSONB NOT NULL DEFAULT '[]',
  category TEXT DEFAULT 'general',
  day_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are publicly readable"
  ON public.questions FOR SELECT
  USING (true);

-- Answers table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  couple_id TEXT NOT NULL,
  answer_index INTEGER NOT NULL,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own answers"
  ON public.answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read answers in their couple"
  ON public.answers FOR SELECT
  USING (
    couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
  );

-- Couples table
CREATE TABLE public.couples (
  id TEXT PRIMARY KEY,
  user_a UUID NOT NULL REFERENCES public.profiles(id),
  user_b UUID NOT NULL REFERENCES public.profiles(id),
  distance_km DOUBLE PRECISION,
  distance_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own couple"
  ON public.couples FOR SELECT
  USING (
    id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert couple"
  ON public.couples FOR INSERT
  WITH CHECK (
    auth.uid() = user_a OR auth.uid() = user_b
  );

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code TEXT;
BEGIN
  -- Generate 6-char invite code
  _code := upper(substr(md5(random()::text), 1, 6));
  
  INSERT INTO public.profiles (id, invite_code, invite_code_expires_at)
  VALUES (
    NEW.id,
    _code,
    now() + interval '24 hours'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 10 starter questions
INSERT INTO public.questions (text, emoji, options, category, day_number) VALUES
('What''s your dream vacation together?', '🏖️', '["Beach vacation", "Mountain cabin", "City trip", "Road trip"]', 'dreams', 1),
('How do you prefer to say goodnight?', '🌙', '["Sweet text", "Voice call", "Video call", "Funny meme"]', 'communication', 2),
('What''s the best surprise gift?', '🎁', '["Handwritten letter", "Surprise visit", "Care package", "Playlist"]', 'love_language', 3),
('Your ideal weekend together?', '☀️', '["Netflix & chill", "Adventure outdoors", "Cook together", "Explore the city"]', 'lifestyle', 4),
('What song reminds you of us?', '🎵', '["Our first dance song", "A love ballad", "Something upbeat", "A throwback hit"]', 'memories', 5),
('How do you handle disagreements?', '💭', '["Talk it out immediately", "Take space first", "Write feelings down", "Hug it out"]', 'communication', 6),
('What makes you feel most loved?', '💕', '["Words of affirmation", "Quality time", "Physical touch", "Acts of service"]', 'love_language', 7),
('Dream date night?', '🌃', '["Fancy dinner", "Stargazing", "Game night", "Dancing"]', 'dreams', 8),
('Morning person or night owl?', '⏰', '["Early bird", "Night owl", "Depends on the day", "Both!"]', 'lifestyle', 9),
('What''s your love language?', '❤️', '["Words", "Touch", "Time", "Gifts"]', 'love_language', 10);

-- Allow reading profiles by invite code (for pairing)
CREATE OR REPLACE FUNCTION public.find_user_by_invite_code(_code TEXT)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name
  FROM public.profiles p
  WHERE p.invite_code = upper(_code)
    AND p.invite_code_expires_at > now()
    AND p.partner_id IS NULL
    AND p.id != auth.uid();
END;
$$;

-- Function to link partners
CREATE OR REPLACE FUNCTION public.link_partners(_partner_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _couple_id TEXT;
  _my_id UUID;
BEGIN
  _my_id := auth.uid();
  
  -- Generate deterministic couple_id
  IF _my_id < _partner_id THEN
    _couple_id := _my_id::text || '_' || _partner_id::text;
  ELSE
    _couple_id := _partner_id::text || '_' || _my_id::text;
  END IF;
  
  -- Update both profiles
  UPDATE public.profiles SET partner_id = _partner_id, couple_id = _couple_id, invite_code = NULL WHERE id = _my_id;
  UPDATE public.profiles SET partner_id = _my_id, couple_id = _couple_id, invite_code = NULL WHERE id = _partner_id;
  
  -- Create couple record
  INSERT INTO public.couples (id, user_a, user_b)
  VALUES (_couple_id, _my_id, _partner_id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN _couple_id;
END;
$$;
