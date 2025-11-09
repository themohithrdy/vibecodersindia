-- Create share_comments table
CREATE TABLE public.share_comments (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  share_id UUID NOT NULL REFERENCES public.shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.share_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view share comments" 
ON public.share_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create share comments" 
ON public.share_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own share comments" 
ON public.share_comments 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own share comments" 
ON public.share_comments 
FOR UPDATE 
USING (auth.uid() = user_id);