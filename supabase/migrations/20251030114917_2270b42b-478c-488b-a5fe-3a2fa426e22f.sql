-- Enable RLS on tables that don't have it yet

-- Enable RLS on posts table if not already enabled
DO $$ 
BEGIN
  ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Enable RLS on comments table if not already enabled  
DO $$
BEGIN
  ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Enable RLS on users table if not already enabled
DO $$
BEGIN
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;