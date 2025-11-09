import { Heart } from 'lucide-react';
import { useLike } from '@/hooks/useLike';
import { Button } from '@/components/ui/button';

interface LikeButtonProps {
  postId: string;
  postType: 'post' | 'ai_news' | 'build' | 'share';
}

export function LikeButton({ postId, postType }: LikeButtonProps) {
  const { isLiked, likeCount, toggleLike, isLoading } = useLike(postId, postType);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLike}
      disabled={isLoading}
      className="gap-2 hover:text-primary transition-colors"
    >
      <Heart
        className={`h-5 w-5 transition-all ${
          isLiked ? 'fill-primary text-primary' : 'text-muted-foreground'
        }`}
      />
      <span className="text-sm font-medium">{likeCount}</span>
    </Button>
  );
}
