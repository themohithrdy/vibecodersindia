import { Heart, MessageCircle, Lightbulb, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface StoryCardProps {
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  tags: string[];
  learned: number;
  inspired: number;
  loved: number;
  comments: number;
  imageUrl?: string;
}

export default function StoryCard({ 
  title, 
  content, 
  author, 
  authorAvatar,
  tags, 
  learned, 
  inspired, 
  loved,
  comments,
  imageUrl 
}: StoryCardProps) {
  const [reactions, setReactions] = useState({ learned, inspired, loved });
  const [activeReactions, setActiveReactions] = useState({ learned: false, inspired: false, loved: false });

  const handleReaction = (type: 'learned' | 'inspired' | 'loved') => {
    setActiveReactions(prev => ({ ...prev, [type]: !prev[type] }));
    setReactions(prev => ({
      ...prev,
      [type]: activeReactions[type] ? prev[type] - 1 : prev[type] + 1
    }));
  };

  return (
    <Card className="glass-card hover:border-accent/50 transition-all duration-300">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{author}</p>
            <p className="text-xs text-muted-foreground">shared a story</p>
          </div>
          <Badge variant="secondary">Story</Badge>
        </div>
        <h3 className="text-2xl font-bold leading-tight hover:text-accent transition-colors cursor-pointer">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl && (
          <div className="h-64 overflow-hidden rounded-lg">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <p className="text-muted-foreground leading-relaxed">{content}</p>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('learned')}
              className={activeReactions.learned ? "text-blue-500" : ""}
            >
              <Lightbulb className={`h-4 w-4 mr-1 ${activeReactions.learned ? "fill-current" : ""}`} />
              <span className="text-xs">Learned {reactions.learned}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('inspired')}
              className={activeReactions.inspired ? "text-accent" : ""}
            >
              <Sparkles className={`h-4 w-4 mr-1 ${activeReactions.inspired ? "fill-current" : ""}`} />
              <span className="text-xs">Inspired {reactions.inspired}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('loved')}
              className={activeReactions.loved ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 mr-1 ${activeReactions.loved ? "fill-current" : ""}`} />
              <span className="text-xs">{reactions.loved}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <MessageCircle className="h-4 w-4 mr-1" />
            {comments}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
