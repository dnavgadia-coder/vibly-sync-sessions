-- Add more questions to public.questions
-- Run this in Supabase Dashboard → SQL Editor (or Lovable database / SQL)
-- No code changes; this only inserts rows.

INSERT INTO public.questions (text, emoji, options, category, day_number) VALUES
('What would you do if you had a free day with no plans?', '✨', '["Stay in and relax", "Go on an adventure", "Try something new", "Spend it with family"]', 'lifestyle', 11),
('How do you like to celebrate small wins?', '🎉', '["Share it right away", "Quiet moment together", "Treat ourselves", "Save it for later"]', 'communication', 12),
('What''s one thing you want to try together this year?', '🌟', '["Travel somewhere new", "Learn a skill", "Start a project", "Break a habit"]', 'dreams', 13),
('When you''re stressed, what helps you most?', '🧘', '["Talking it out", "Being alone", "Exercise", "Your support"]', 'communication', 14),
('What''s your go-to way to show you care?', '💝', '["Words", "Little gestures", "Quality time", "Surprises"]', 'love_language', 15),
('What makes you laugh the most?', '😂', '["Memes", "Their humor", "Old memories", "Silly moments"]', 'memories', 16),
('How do you prefer to resolve a misunderstanding?', '🤝', '["Talk in person", "Text first", "Give space then talk", "Write it down"]', 'communication', 17),
('What''s your ideal way to spend a rainy day?', '🌧️', '["Movie marathon", "Cook together", "Read or nap", "Go out anyway"]', 'lifestyle', 18),
('What do you appreciate most about your partner?', '❤️', '["Their patience", "Their humor", "How they listen", "Their support"]', 'love_language', 19),
('What''s a tradition you''d like to start together?', '🕯️', '["Weekly date night", "Annual trip", "Daily check-in", "Seasonal ritual"]', 'dreams', 20);
