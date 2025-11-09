import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  created_at: string;
}

interface ProfileStats {
  postsCount: number;
  learnedCount: number;
  inspiredCount: number;
}

interface UseProfileReturn {
  profile: Profile | null;
  stats: ProfileStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfile(userId: string): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    postsCount: 0,
    learnedCount: 0,
    inspiredCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch profile data
      // @ts-ignore - Supabase generated types issue
      const { data: profileData, error: profileError } = await supabase
        // @ts-ignore
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // @ts-ignore - Type assertion for profile data
      setProfile(profileData as Profile);

      // Count posts across all tables
      // @ts-ignore - Supabase generated types issue
      const [postsResult, buildsResult, sharesResult] = await Promise.all([
        // @ts-ignore
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        // @ts-ignore
        supabase
          .from('builds')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        // @ts-ignore
        supabase
          // @ts-ignore
          .from('shares')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
      ]);

      const totalPosts =
        (postsResult.count || 0) +
        (buildsResult.count || 0) +
        (sharesResult.count || 0);

      // Count engagement (learned and inspired)
      // @ts-ignore - Supabase generated types issue
      const [learnedResult, inspiredResult] = await Promise.all([
        // @ts-ignore
        supabase
          // @ts-ignore
          .from('engagement')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('engagement_type', 'learned'),
        // @ts-ignore
        supabase
          // @ts-ignore
          .from('engagement')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('engagement_type', 'inspired'),
      ]);

      setStats({
        postsCount: totalPosts,
        learnedCount: learnedResult.count || 0,
        inspiredCount: inspiredResult.count || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return { profile, stats, isLoading, error, refetch: fetchProfile };
}
