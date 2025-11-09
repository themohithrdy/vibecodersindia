import { Heart, MessageCircle, Bookmark, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NewsCardProps {
  title: string;
  excerpt: string;
  source: string;
  category: string;
  likes: number;
  comments: number;
  imageUrl?: string;
}

export default function NewsCard({ title, excerpt, source, category, likes, comments, imageUrl }: NewsCardProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <Card className="glass-card hover:border-primary/50 transition-all duration-300">
      {imageUrl && (
        <div className="h-48 overflow-hidden rounded-t-lg">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{category}</Badge>
          <span className="text-xs text-muted-foreground">{source}</span>
        </div>
        <h3 className="text-xl font-semibold leading-tight hover:text-primary transition-colors cursor-pointer">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-2">{excerpt}</p>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={liked ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              {comments}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setBookmarked(!bookmarked)}
              className={bookmarked ? "text-accent" : ""}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
