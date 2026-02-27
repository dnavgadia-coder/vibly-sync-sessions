
-- Add tier column to questions table
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS tier integer NOT NULL DEFAULT 1;

-- Create unlink_partner function for Settings screen
CREATE OR REPLACE FUNCTION public.unlink_partner()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _my_id UUID;
  _partner_id UUID;
  _couple_id TEXT;
BEGIN
  _my_id := auth.uid();
  
  SELECT partner_id, couple_id INTO _partner_id, _couple_id
  FROM profiles WHERE id = _my_id;
  
  IF _partner_id IS NULL THEN RETURN; END IF;
  
  -- Clear both profiles
  UPDATE profiles SET partner_id = NULL, couple_id = NULL WHERE id = _my_id;
  UPDATE profiles SET partner_id = NULL, couple_id = NULL WHERE id = _partner_id;
  
  -- Regenerate invite codes for both
  UPDATE profiles SET 
    invite_code = upper(substr(md5(random()::text), 1, 6)),
    invite_code_expires_at = now() + interval '24 hours'
  WHERE id = _my_id;
  
  UPDATE profiles SET 
    invite_code = upper(substr(md5(random()::text), 1, 6)),
    invite_code_expires_at = now() + interval '24 hours'
  WHERE id = _partner_id;
  
  -- Delete couple record
  IF _couple_id IS NOT NULL THEN
    DELETE FROM couples WHERE id = _couple_id;
  END IF;
END;
$$;
