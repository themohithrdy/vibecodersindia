import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseSaveReturn {
  isSaved: boolean;
  toggleSave: () => Promise<void>;
  isLoading: boolean;
}

export function useSave(postId: string, postType: 'post' | 'ai_news' | 'build' | 'share'): UseSaveReturn {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSaveStatus();
  }, [postId, user]);

  const fetchSaveStatus = async () => {
    if (!user) {
      setIsSaved(false);
      return;
    }

    // @ts-ignore - Supabase generated types issue
    const { data, error } = await supabase
      // @ts-ignore
      .from('saved_items')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('post_type', postType)
      .maybeSingle();

    if (!error) {
      setIsSaved(!!data);
    }
  };

  const toggleSave = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please sign in to save posts',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Optimistic UI update
    const previousSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      if (isSaved) {
        // Unsave
        // @ts-ignore - Supabase generated types issue
        const { error } = await supabase
          // @ts-ignore
          .from('saved_items')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('post_type', postType);

        if (error) throw error;

        toast({
          title: 'Removed from saved',
          description: 'Post removed from your saved items',
        });
      } else {
        // Save
        // @ts-ignore - Supabase generated types issue
        const { error } = await supabase
          // @ts-ignore
          .from('saved_items')
          .insert({
            post_id: postId,
            user_id: user.id,
            post_type: postType,
          });

        if (error) throw error;

        toast({
          title: 'Saved',
          description: 'Post added to your saved items',
        });
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setIsSaved(previousSaved);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to update saved status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isSaved, toggleSave, isLoading };
}
