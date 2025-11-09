-- Enable Row Level Security
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_comments ENABLE ROW LEVEL SECURITY;

-- Builds policies - allow public read, anyone can create/update/delete for now
CREATE POLICY "Anyone can view builds"
  ON public.builds FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create builds"
  ON public.builds FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update builds"
  ON public.builds FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete builds"
  ON public.builds FOR DELETE
  USING (true);

-- Build comments policies
CREATE POLICY "Anyone can view build comments"
  ON public.build_comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create build comments"
  ON public.build_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update build comments"
  ON public.build_comments FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete build comments"
  ON public.build_comments FOR DELETE
  USING (true);