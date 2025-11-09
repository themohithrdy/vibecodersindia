-- Backfill existing users from profiles into users table
INSERT INTO public.users (id, name, email)
SELECT 
  p.id,
  COALESCE(p.full_name, p.username, 'User'),
  au.email
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = p.id
);