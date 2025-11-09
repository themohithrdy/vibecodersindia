import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Github, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface BuildCardProps {
  id: string; // added to fix TS error
  title: string;
  description: string;
  tags?: string[] | null;
  stars: number;
  status: string;
  github_url?: string | null;
  live_url?: string | null;
  created_at: string; // added for post time
  users?: {
    name: string;
    avatar_url?: string | null;
  } | null;
  comment_count?: number;
}

export default function BuildCard({
  id,
  title,
  description,
  tags,
  stars,
  status,
  github_url,
  live_url,
  users,
  comment_count,
  created_at,
}: BuildCardProps) {
  // Safely handle tags
  const safeTags = Array.isArray(tags) ? tags : [];

  return (
    <Card key={id} className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-semibold hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground line-clamp-2">{description}</p>
          </div>
          <Badge variant={status === 'Completed' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </div>

        {/* Tags */}
        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {safeTags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Links and Stats */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            {github_url && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-2"
              >
                <a href={github_url} target="_blank" rel="noopener noreferrer">
                  <Github size={16} />
                  Code
                </a>
              </Button>
            )}
            {live_url && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-2"
              >
                <a href={live_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} />
                  Live Demo
                </a>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{stars || 0}</span>
          </div>
        </div>

        {/* User info and time */}
        {users && (
          <div className="flex items-center gap-2 pt-2 justify-between">
            <div className="flex items-center gap-2">
              {users.avatar_url ? (
                <img
                  src={users.avatar_url}
                  alt={users.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {users.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
              )}
              <span className="text-sm text-muted-foreground">{users.name}</span>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
