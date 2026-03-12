INSERT INTO public.profiles (id, name, invite_code, invite_code_expires_at)
VALUES (
  '66fe8acd-0e86-4c60-8a4c-36bf2b653fd4',
  '',
  upper(substr(md5(random()::text), 1, 6)),
  now() + interval '24 hours'
)
ON CONFLICT (id) DO NOTHING;