import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import RightSidebar from '@/components/RightSidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LikeButton } from '@/components/LikeButton';
import { SaveButton } from '@/components/SaveButton';
import CommentSection from '@/components/CommentSection';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Share {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  user_id: string;
}

export default function Share() {
  const navigate = useNavigate();
  const [shares, setShares] = useState<Share[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchShares();

    const sharesChannel = supabase
      .channel('shares-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shares' }, () => {
        fetchShares();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sharesChannel);
    };
  }, []);

  const fetchShares = async () => {
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shares:', error);
    } else {
      setShares((data as Share[]) || []);
    }
  };
  
  return (
    <Layout rightSidebar={<RightSidebar />}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Share</h1>
            <p className="text-muted-foreground text-lg">
              Learn from others' building journeys and share your own
            </p>
          </div>
          <Button className="gradient-accent" onClick={() => navigate('/share/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Share Your Story
          </Button>
        </div>

        <div className="space-y-6">
          {shares.map((share) => (
            <Card key={share.id} className="glass-card">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{share.title}</h2>
                  <p className="text-muted-foreground">{share.content}</p>
                </div>
                {share.tags && share.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {share.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
                <Separator />
                <div className="flex items-center gap-4">
                  <LikeButton postId={share.id} postType="share" />
                  <SaveButton postId={share.id} postType="share" />
                </div>
                <CommentSection 
                  itemId={share.id} 
                  itemType="share"
                  onCommentCountChange={(count) => setCommentCounts({ ...commentCounts, [share.id]: count })}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
