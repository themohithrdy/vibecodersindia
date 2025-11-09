-- Add foreign key constraints for builds and build_comments tables

-- Add foreign key from builds.user_id to users.id
ALTER TABLE public.builds
ADD CONSTRAINT builds_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- Add foreign key from build_comments.user_id to users.id
ALTER TABLE public.build_comments
ADD CONSTRAINT build_comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- Add foreign key from build_comments.build_id to builds.id
ALTER TABLE public.build_comments
ADD CONSTRAINT build_comments_build_id_fkey
FOREIGN KEY (build_id)
REFERENCES public.builds(id)
ON DELETE CASCADE;