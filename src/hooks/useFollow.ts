import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UseFollowReturn {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  toggleFollow: () => Promise<void>;
  loading: boolean;
}

export function useFollow(targetUserId: string): UseFollowReturn {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchFollowStatus = async () => {
    if (!user) {
      setIsFollowing(false);
      return;
    }

    const { data, error } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching follow status:', error);
      setIsFollowing(false);
    } else {
      setIsFollowing(!!data);
    }
  };

  const fetchFollowerCount = async () => {
    const { count, error } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);

    if (error) {
      console.error('Error fetching follower count:', error);
      setFollowersCount(0);
    } else {
      setFollowersCount(count || 0);
    }
  };

  const fetchFollowingCount = async () => {
    const { count, error } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', targetUserId);

    if (error) {
      console.error('Error fetching following count:', error);
      setFollowingCount(0);
    } else {
      setFollowingCount(count || 0);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      fetchFollowStatus();
      fetchFollowerCount();
      fetchFollowingCount();
    }
  }, [targetUserId, user]);

  // Real-time subscription for instant updates
  useEffect(() => {
    if (!targetUserId) return;

    const channel = supabase
      .channel('followers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `following_id=eq.${targetUserId}`
        },
        () => {
          fetchFollowerCount();
          fetchFollowStatus();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `follower_id=eq.${targetUserId}`
        },
        () => {
          fetchFollowingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId]);

  const toggleFollow = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to follow users',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;

        // Fetch fresh data
        await fetchFollowStatus();
        await fetchFollowerCount();

        toast({
          title: 'Unfollowed',
          description: 'You have unfollowed this user'
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;

        // Fetch fresh data
        await fetchFollowStatus();
        await fetchFollowerCount();

        toast({
          title: 'Following',
          description: 'You are now following this user'
        });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to update follow status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    followersCount,
    followingCount,
    toggleFollow,
    loading
  };
}
