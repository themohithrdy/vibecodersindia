-- Create followers table for user follow system
CREATE TABLE public.followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable Row Level Security
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Create policies for followers table
CREATE POLICY "Anyone can view followers"
  ON public.followers
  FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.followers
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON public.followers
  FOR DELETE
  USING (auth.uid() = follower_id);

-- Enable real-time updates
ALTER TABLE public.followers REPLICA IDENTITY FULL;