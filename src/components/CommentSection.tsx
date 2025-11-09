import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users?: {
    name: string;
    avatar_url: string | null;
  } | null;
}

interface CommentSectionProps {
  itemId: string;
  itemType: 'build' | 'share' | 'post' | 'ai_news';
  onCommentCountChange?: (count: number) => void;
}

export default function CommentSection({ 
  itemId, 
  itemType,
  onCommentCountChange 
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load comments based on item type
  const loadComments = async () => {
    try {
      setLoading(true);
      let data: any[] = [];

      // Query the correct table based on itemType
      if (itemType === 'build' || itemType === 'post') {
        const { data: commentData, error } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', itemId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        data = commentData || [];
      } else if (itemType === 'share') {
        const { data: commentData, error } = await supabase
          .from('share_comments')
          .select('*')
          .eq('share_id', itemId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        data = commentData || [];
      } else if (itemType === 'ai_news') {
        const { data: commentData, error } = await supabase
          .from('ai_news_comments')
          .select('*')
          .eq('ai_news_id', itemId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        data = commentData || [];
      }

      // Transform data to include user info
      const transformedComments: Comment[] = data.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        users: {
          name: 'Community Member',
          avatar_url: null
        }
      }));

      setComments(transformedComments);
      if (onCommentCountChange) {
        onCommentCountChange(transformedComments.length);
      }
    } catch (error: any) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();

    // Subscribe to real-time changes
    const getChannelConfig = () => {
      if (itemType === 'build' || itemType === 'post') {
        return { table: 'comments' as const, filter: `post_id=eq.${itemId}` };
      } else if (itemType === 'share') {
        return { table: 'share_comments' as const, filter: `share_id=eq.${itemId}` };
      } else {
        return { table: 'ai_news_comments' as const, filter: `ai_news_id=eq.${itemId}` };
      }
    };

    const config = getChannelConfig();
    const channel = supabase
      .channel(`comments-${itemId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: config.table,
        filter: config.filter
      }, () => {
        loadComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, itemType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Insert into the correct table
      if (itemType === 'build' || itemType === 'post') {
        const { error } = await supabase
          .from('comments')
          .insert({
            content: newComment.trim(),
            user_id: user.id,
            post_id: itemId
          });
        if (error) throw error;
      } else if (itemType === 'share') {
        const { error } = await supabase
          .from('share_comments')
          .insert({
            content: newComment.trim(),
            user_id: user.id,
            share_id: itemId
          });
        if (error) throw error;
      } else if (itemType === 'ai_news') {
        const { error } = await supabase
          .from('ai_news_comments')
          .insert({
            content: newComment.trim(),
            user_id: user.id,
            ai_news_id: itemId
          });
        if (error) throw error;
      }

      setNewComment('');
      toast({
        title: "Success",
        description: "Comment added!",
      });
      
      loadComments();
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    try {
      // Delete from the correct table
      if (itemType === 'build' || itemType === 'post') {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else if (itemType === 'share') {
        const { error } = await supabase
          .from('share_comments')
          .delete()
          .eq('id', commentId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else if (itemType === 'ai_news') {
        const { error } = await supabase
          .from('ai_news_comments')
          .delete()
          .eq('id', commentId)
          .eq('user_id', user.id);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Comment deleted",
      });
      
      loadComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  if (loading && comments.length === 0) {
    return <div className="text-center text-muted-foreground py-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">
        Comments ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {comment.users?.name?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
              </div>

              {/* Comment Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {comment.users?.name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
                
                {/* Delete button for own comments */}
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-destructive hover:underline mt-1"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="resize-none"
            rows={3}
            disabled={submitting}
          />
          <Button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            className="w-full"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Please log in to comment
          </p>
        </div>
      )}
    </div>
  );
}
