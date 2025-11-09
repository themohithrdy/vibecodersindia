import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import RightSidebar from '@/components/RightSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Flame, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LikeButton } from '@/components/LikeButton';
import { SaveButton } from '@/components/SaveButton';
import CommentSection from '@/components/CommentSection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AINewsItem {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  category: string | null;
  source: string | null;
  created_at: string;
}

const NewsArticleCard = ({ item }: { item: AINewsItem }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  return (
    <Card className="reddit-card">
      <Badge className="mb-3 bg-muted text-muted-foreground border-0 text-xs px-3 py-1">
        {item.category || 'General'}
      </Badge>
      {item.image_url && (
        <img 
          src={item.image_url} 
          alt={item.title}
          className="w-full h-44 object-cover rounded-xl mb-3"
        />
      )}
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
        {item.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
        {item.content || 'No description available'}
      </p>
      
      {/* Engagement Bar */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
        <LikeButton postId={item.id} postType="ai_news" />
        <SaveButton postId={item.id} postType="ai_news" />
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{commentCount}</span>
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* Comments Section */}
      <Collapsible open={showComments} onOpenChange={setShowComments}>
        <CollapsibleContent>
          <CommentSection 
            itemId={item.id} 
            itemType="ai_news"
            onCommentCountChange={setCommentCount}
          />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default function AINews() {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState<AINewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAINews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI news:', error);
      } else {
        setNewsItems(data || []);
      }
      setLoading(false);
    };

    fetchAINews();
  }, []);

  return (
    <Layout rightSidebar={<RightSidebar />}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Flame className="h-10 w-10 text-primary" />
              AI News
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay updated with latest AI trends, tools, and insights
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg" onClick={() => navigate('/ai-news/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add News
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-8">
            <TabsTrigger 
              value="news"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none font-semibold text-lg px-0 py-4 bg-transparent text-muted-foreground"
            >
              AI News
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="news" className="mt-8">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading AI news...</div>
            ) : newsItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No AI news yet. Be the first to add one!</div>
            ) : (
              <div className="space-y-6">
                {newsItems.map((news) => (
                  <NewsArticleCard key={news.id} item={news} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
