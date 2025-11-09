import { Flame, Lightbulb, MessageCircle, Bookmark } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface CommunityPostCardProps {
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  tags: string[];
  useful: number;
  learned: number;
  comments: number;
}

export default function CommunityPostCard({ 
  title, 
  content, 
  author, 
  authorAvatar,
  tags, 
  useful, 
  learned,
  comments 
}: CommunityPostCardProps) {
  const [reactions, setReactions] = useState({ useful, learned });
  const [activeReactions, setActiveReactions] = useState({ useful: false, learned: false });
  const [bookmarked, setBookmarked] = useState(false);

  const handleReaction = (type: 'useful' | 'learned') => {
    setActiveReactions(prev => ({ ...prev, [type]: !prev[type] }));
    setReactions(prev => ({
      ...prev,
      [type]: activeReactions[type] ? prev[type] - 1 : prev[type] + 1
    }));
  };

  return (
    <Card className="glass-card hover:border-primary/50 transition-all duration-300">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{author}</p>
            <p className="text-xs text-muted-foreground">shared an insight</p>
          </div>
        </div>
        <h3 className="text-xl font-semibold leading-tight hover:text-primary transition-colors cursor-pointer">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{content}</p>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('useful')}
              className={activeReactions.useful ? "text-orange-500" : ""}
            >
              <Flame className={`h-4 w-4 mr-1 ${activeReactions.useful ? "fill-current" : ""}`} />
              <span className="text-xs">Useful {reactions.useful}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('learned')}
              className={activeReactions.learned ? "text-blue-500" : ""}
            >
              <Lightbulb className={`h-4 w-4 mr-1 ${activeReactions.learned ? "fill-current" : ""}`} />
              <span className="text-xs">Learned {reactions.learned}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              {comments}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setBookmarked(!bookmarked)}
              className={bookmarked ? "text-accent" : ""}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
