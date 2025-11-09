import { TrendingUp, Flame, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const trendingNews = [
  { title: 'GPT-5 Release Date Announced', category: 'AI Models', heat: 98 },
  { title: 'India AI Summit 2025', category: 'Events', heat: 87 },
  { title: 'New Computer Vision Breakthrough', category: 'Research', heat: 76 },
];

const topBuilds = [
  { title: 'ChatBot for Education', author: 'Rahul K', stars: 245 },
  { title: 'AI Image Generator', author: 'Priya S', stars: 198 },
  { title: 'Voice Assistant', author: 'Amit P', stars: 156 },
];

export default function RightSidebar() {
  return (
    <div className="space-y-6">
      {/* Trending AI News */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            Trending AI News
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingNews.map((news, idx) => (
            <div key={idx} className="space-y-1 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <p className="font-medium text-sm line-clamp-1">{news.title}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">{news.category}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  {news.heat}%
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Builds */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-accent" />
            Top Builds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topBuilds.map((build, idx) => (
            <div key={idx} className="space-y-1 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <p className="font-medium text-sm line-clamp-1">{build.title}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>by {build.author}</span>
                <span className="flex items-center gap-1">
                  ⭐ {build.stars}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Challenges - Placeholder */}
      <Card className="glass-card border-dashed">
        <CardHeader>
          <CardTitle className="text-lg text-muted-foreground">Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
