import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/AuthContext';

interface FollowButtonProps {
  userId: string;
}

export function FollowButton({ userId }: FollowButtonProps) {
  const { user } = useAuth();
  const { isFollowing, followersCount, toggleFollow, loading } = useFollow(userId);

  // Don't show button if viewing own profile
  if (!user || user.id === userId) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={toggleFollow}
        disabled={loading}
        variant={isFollowing ? 'secondary' : 'default'}
        size="sm"
        className="min-w-[120px]"
      >
        {loading ? (
          'Loading...'
        ) : isFollowing ? (
          <>
            <UserMinus className="w-4 h-4 mr-2" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Follow
          </>
        )}
      </Button>
      <span className="text-sm text-muted-foreground">
        {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
      </span>
    </div>
  );
}
