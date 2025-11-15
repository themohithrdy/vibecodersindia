import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import RightSidebar from '@/components/RightSidebar';
import BuildCard from '@/components/BuildCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CommentSection from '@/components/CommentSection';
import { LikeButton } from '@/components/LikeButton';
import { SaveButton } from '@/components/SaveButton';

interface Build {
  id: string;
  title: string;
  description: string;
  tags: string[] | null;
  stars: number;
  status: string;
  github_url: string | null;
  live_url: string | null;
  created_at: string;
  user_id: string;
  comment_count?: number;
}

export default function Build() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBuilds();

    const buildsChannel = supabase
      .channel('builds-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'builds' 
      }, () => {
        fetchBuilds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(buildsChannel);
    };
  }, []);

  const fetchBuilds = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('builds')
        .select('*, profiles:user_id (name, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;

setBuilds(data as Build[]);
    } catch (err: any) {
      console.error('Error fetching builds:', err);
      toast({
        title: "Error",
        description: "Failed to load builds",
        variant: "destructive",
      });
      setBuilds([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = (buildId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [buildId]: !prev[buildId]
    }));
  };

  const completedBuilds = builds.filter(b => b.status === 'Completed');
  const inProgressBuilds = builds.filter(b => b.status === 'In Progress');

  const renderBuildList = (buildList: Build[]) => {
    if (loading) {
      return <div className="text-center py-12">Loading builds...</div>;
    }

    if (buildList.length === 0) {
      return (
        <div className="text-center py-12 glass-card rounded-xl p-8">
          <p className="text-muted-foreground text-lg mb-4">
            No builds yet. Be the first to share your project!
          </p>
          <Button onClick={() => navigate('/build/new')} className="gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Build
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {buildList.map((build) => (
          <div key={build.id} className="space-y-4">
            <BuildCard {...build} comment_count={commentCounts[build.id] || 0} />
            
            <Separator />
            
            <div className="flex items-center gap-4 px-2">
              <LikeButton postId={build.id} postType="build" />
              <SaveButton postId={build.id} postType="build" />
              <button 
                onClick={() => toggleComments(build.id)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <MessageCircle size={20} />
                <span>{commentCounts[build.id] || 0} Comments</span>
              </button>
            </div>
            
            {expandedComments[build.id] && (
              <div className="mt-4 pt-4 border-t">
                <CommentSection 
                  itemId={build.id} 
                  itemType="build"
                  onCommentCountChange={(count) => 
                    setCommentCounts(prev => ({ ...prev, [build.id]: count }))
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout rightSidebar={<RightSidebar />}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Build</h1>
            <p className="text-muted-foreground text-lg">
              Showcase your AI projects and discover others
            </p>
          </div>
          <Button className="gradient-primary" onClick={() => navigate('/build/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>

        <Tabs defaultValue="completed" className="w-full">
          <TabsList className="glass-card">
            <TabsTrigger value="completed">
              Completed ({completedBuilds.length})
            </TabsTrigger>
            <TabsTrigger value="progress">
              In Progress ({inProgressBuilds.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="completed" className="mt-6">
            {renderBuildList(completedBuilds)}
          </TabsContent>
          
          <TabsContent value="progress" className="mt-6">
            {renderBuildList(inProgressBuilds)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
