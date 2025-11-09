import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CommentSection from '@/components/CommentSection';
import { LikeButton } from '@/components/LikeButton';
import { SaveButton } from '@/components/SaveButton';
import { Separator } from '@/components/ui/separator';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  users: {
    name: string;
    avatar_url: string | null;
  };
  comment_count?: number;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', image_url: '' });
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();

    // Subscribe to new posts
    const postsChannel = supabase
      .channel('posts-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
  };

  const createPost = async () => {
    if (!user) {
      toast({ title: 'Please sign in to create a post', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!newPost.title || !newPost.content) {
      toast({ title: 'Please fill in title and content', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('posts').insert({
      title: newPost.title,
      content: newPost.content,
      user_id: user.id,
      category: newPost.category,
      image_url: newPost.image_url || null,
    });

    if (error) {
      toast({ title: 'Error creating post', description: error.message, variant: 'destructive' });
    } else {
      setNewPost({ title: '', content: '', category: 'general', image_url: '' });
      toast({ title: 'Post created successfully!' });
    }
  };


  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Community Feed</h1>
          <p className="text-muted-foreground">Share your AI projects, insights, and connect with fellow creators</p>
        </div>

        <Card className="p-6 space-y-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
              <AvatarFallback>{user?.user_metadata?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">Create a Post</span>
          </div>

            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="Give your post a catchy title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="bg-background mt-1"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={newPost.category} onValueChange={(value) => setNewPost({ ...newPost, category: value })}>
                  <SelectTrigger className="bg-background mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="ML">Machine Learning</SelectItem>
                    <SelectItem value="News">News</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                    <SelectItem value="Tutorial">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  placeholder="Share your thoughts, ideas, or projects..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="bg-background min-h-[120px] mt-1"
                />
              </div>

              <div>
                <Label>Image URL (optional)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={newPost.image_url}
                    onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                    className="bg-background"
                  />
                  <Button variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={createPost} className="w-full" size="lg">
                Create Post
              </Button>
            </div>
          </Card>

        <div className="space-y-6">
          {posts.length === 0 && (
            <Card className="p-12 text-center bg-card border-border">
              <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
            </Card>
          )}

          {posts.map((post) => (
            <Card key={post.id} className="p-6 bg-card border-border space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={post.users?.avatar_url || ''} />
                  <AvatarFallback>{post.users?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{post.users?.name || 'Unknown'}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-2">{post.title}</h3>
                  <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.image_url && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LikeButton postId={post.id} postType="post" />
                  <button className="flex items-center gap-2 hover:text-primary transition-colors text-muted-foreground px-3 py-2 rounded-md hover:bg-accent">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{commentCounts[post.id] || 0}</span>
                  </button>
                </div>
                <SaveButton postId={post.id} postType="post" />
              </div>

              <div className="border-t border-border pt-4">
                <CommentSection 
                  itemId={post.id} 
                  itemType="post"
                  onCommentCountChange={(count) => setCommentCounts({ ...commentCounts, [post.id]: count })}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
