import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SaveButtonProps {
  postId: string;
  postType: 'post' | 'ai_news' | 'build' | 'share';
}

export function SaveButton({ postId, postType }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSaveStatus();
    fetchSaveCount();

    const channel = supabase
      .channel(`saves-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_items',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchSaveCount();
          if (user) fetchSaveStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, user]);

  const fetchSaveStatus = async () => {
    if (!user) {
      setIsSaved(false);
      return;
    }

    const { data, error } = await supabase
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

  const fetchSaveCount = async () => {
    const { count, error } = await supabase
      .from('saved_items')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('post_type', postType);

    if (!error && count !== null) {
      setSaveCount(count);
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

    const previousSaved = isSaved;
    const previousCount = saveCount;
    setIsSaved(!isSaved);
    setSaveCount(isSaved ? saveCount - 1 : saveCount + 1);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_items')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('post_type', postType);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_items')
          .insert({
            post_id: postId,
            user_id: user.id,
            post_type: postType,
          });

        if (error) throw error;
      }
    } catch (error: any) {
      setIsSaved(previousSaved);
      setSaveCount(previousCount);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to update save',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSave}
      disabled={isLoading}
      className="gap-2 hover:text-primary transition-colors"
    >
      <Bookmark
        className={`h-5 w-5 transition-all ${
          isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'
        }`}
      />
      <span className="text-sm font-medium">{saveCount}</span>
    </Button>
  );
}
