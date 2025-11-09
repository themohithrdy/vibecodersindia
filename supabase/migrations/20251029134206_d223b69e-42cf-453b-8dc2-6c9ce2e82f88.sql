-- Create builds table
CREATE TABLE public.builds (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  stars BIGINT DEFAULT 0,
  status TEXT DEFAULT 'In Progress',
  github_url TEXT,
  live_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create build_comments table
CREATE TABLE public.build_comments (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  build_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample builds
INSERT INTO public.builds (user_id, title, description, tags, stars, status, github_url, live_url) VALUES
('11111111-1111-1111-1111-111111111111', 'AI-Powered Code Review Assistant', 'Automated code review tool using GPT-4 to identify bugs and suggest improvements.', ARRAY['GPT-4', 'Python', 'DevOps'], 234, 'Completed', '#', '#'),
('11111111-1111-1111-1111-111111111111', 'Smart Agriculture Predictor', 'ML model to predict crop yield based on weather and soil conditions.', ARRAY['Machine Learning', 'Python', 'TensorFlow'], 198, 'Completed', '#', NULL),
('11111111-1111-1111-1111-111111111111', 'Voice-Based Personal Assistant', 'AI assistant that responds to voice commands in multiple Indian languages.', ARRAY['Speech Recognition', 'Python', 'AI'], 267, 'Completed', NULL, '#'),
('11111111-1111-1111-1111-111111111111', 'Regional Language Chatbot', 'Multi-lingual chatbot supporting Hindi, Tamil, and Bengali for customer support.', ARRAY['NLP', 'React', 'Node.js'], 189, 'In Progress', NULL, NULL),
('11111111-1111-1111-1111-111111111111', 'AI Resume Analyzer', 'Tool to analyze resumes and match candidates with job requirements using AI.', ARRAY['GPT-4', 'Python', 'Flask'], 145, 'In Progress', NULL, NULL);

-- Enable realtime for builds
ALTER TABLE public.builds REPLICA IDENTITY FULL;

-- Enable realtime for build_comments
ALTER TABLE public.build_comments REPLICA IDENTITY FULL;