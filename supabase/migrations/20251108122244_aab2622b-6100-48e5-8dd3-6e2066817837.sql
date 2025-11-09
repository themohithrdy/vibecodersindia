-- Create ai_news_comments table
CREATE TABLE IF NOT EXISTS public.ai_news_comments (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  ai_news_id uuid NOT NULL REFERENCES public.ai_news(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_news_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view ai_news comments"
  ON public.ai_news_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create ai_news comments"
  ON public.ai_news_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_news comments"
  ON public.ai_news_comments
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai_news comments"
  ON public.ai_news_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER TABLE public.ai_news_comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_news_comments;