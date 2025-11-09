-- Enable realtime for comments table
ALTER TABLE public.comments REPLICA IDENTITY FULL;

-- Add comments table to realtime publication (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
END $$;

-- Enable realtime for build_comments table
ALTER TABLE public.build_comments REPLICA IDENTITY FULL;

-- Add build_comments table to realtime publication (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'build_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.build_comments;
  END IF;
END $$;