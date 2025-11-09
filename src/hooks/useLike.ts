import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseLikeReturn {
  isLiked: boolean;
  likeCount: number;
  toggleLike: () => Promise<void>;
  isLoading: boolean;
}

export function useLike(postId: string, postType: 'post' | 'ai_news' | 'build' | 'share'): UseLikeReturn {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLikeStatus();
    fetchLikeCount();

    // Subscribe to real-time like changes
    const channel = supabase
      .channel(`likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchLikeCount();
          if (user) fetchLikeStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, user]);

  const fetchLikeStatus = async () => {
    if (!user) {
      setIsLiked(false);
      return;
    }

    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('post_type', postType)
      .maybeSingle();

    if (error) {
      console.error('Error fetching like status:', error);
      setIsLiked(false);
    } else {
      setIsLiked(!!data);
    }
  };

  const fetchLikeCount = async () => {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('post_type', postType);

    if (error) {
      console.error('Error fetching like count:', error);
      setLikeCount(0);
    } else {
      setLikeCount(count || 0);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please sign in to like posts',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Optimistic UI update
    const previousLiked = isLiked;
    const previousCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('post_type', postType);

        if (error) throw error;
        
        // Verify deletion by fetching fresh data
        await fetchLikeCount();
        await fetchLikeStatus();
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id,
            post_type: postType,
          });

        if (error) throw error;
        
        // Verify insertion by fetching fresh data
        await fetchLikeCount();
        await fetchLikeStatus();
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      
      console.error('Error toggling like:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to update like',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLiked, likeCount, toggleLike, isLoading };
}
