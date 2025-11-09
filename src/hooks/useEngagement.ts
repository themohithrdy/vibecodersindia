import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseEngagementReturn {
  hasEngaged: boolean;
  count: number;
  toggleEngagement: () => Promise<void>;
  isLoading: boolean;
}

export function useEngagement(
  postId: string,
  engagementType: 'learned' | 'inspired'
): UseEngagementReturn {
  const [hasEngaged, setHasEngaged] = useState(false);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEngagementStatus();
    fetchEngagementCount();

    // Subscribe to real-time engagement changes
    const channel = supabase
      .channel(`engagement-${postId}-${engagementType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'engagement',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchEngagementCount();
          if (user) fetchEngagementStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, engagementType, user]);

  const fetchEngagementStatus = async () => {
    if (!user) {
      setHasEngaged(false);
      return;
    }

    // @ts-ignore - Supabase generated types issue
    const { data, error } = await supabase
      // @ts-ignore
      .from('engagement')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('engagement_type', engagementType)
      .maybeSingle();

    if (!error) {
      setHasEngaged(!!data);
    }
  };

  const fetchEngagementCount = async () => {
    // @ts-ignore - Supabase generated types issue
    const { count: totalCount, error } = await supabase
      // @ts-ignore
      .from('engagement')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('engagement_type', engagementType);

    if (!error && totalCount !== null) {
      setCount(totalCount);
    }
  };

  const toggleEngagement = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please sign in to engage with posts',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Optimistic UI update
    const previousEngaged = hasEngaged;
    const previousCount = count;
    setHasEngaged(!hasEngaged);
    setCount(hasEngaged ? count - 1 : count + 1);

    try {
      if (hasEngaged) {
        // Remove engagement
        // @ts-ignore - Supabase generated types issue
        const { error } = await supabase
          // @ts-ignore
          .from('engagement')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('engagement_type', engagementType);

        if (error) throw error;
      } else {
        // Add engagement
        // @ts-ignore - Supabase generated types issue
        const { error } = await supabase
          // @ts-ignore
          .from('engagement')
          .insert({
            post_id: postId,
            user_id: user.id,
            engagement_type: engagementType,
          });

        if (error) throw error;

        toast({
          title: engagementType === 'learned' ? 'Learned!' : 'Inspired!',
          description: `Marked as ${engagementType}`,
        });
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setHasEngaged(previousEngaged);
      setCount(previousCount);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to update engagement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { hasEngaged, count, toggleEngagement, isLoading };
}
