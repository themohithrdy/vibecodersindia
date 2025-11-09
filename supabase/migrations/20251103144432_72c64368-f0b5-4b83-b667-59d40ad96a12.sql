-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('ai-news-images', 'ai-news-images', true),
  ('build-images', 'build-images', true),
  ('share-images', 'share-images', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ai-news-images (admin only upload)
CREATE POLICY "AI news images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ai-news-images');

CREATE POLICY "Admins can upload AI news images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ai-news-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update AI news images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ai-news-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete AI news images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ai-news-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Storage policies for build-images
CREATE POLICY "Build images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'build-images');

CREATE POLICY "Users can upload their own build images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'build-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own build images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'build-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own build images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'build-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for share-images
CREATE POLICY "Share images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'share-images');

CREATE POLICY "Users can upload their own share images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'share-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own share images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'share-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own share images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'share-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);