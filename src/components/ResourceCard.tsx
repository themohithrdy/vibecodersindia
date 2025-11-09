import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ResourceCardProps {
  title: string;
  description: string;
  tags: string[];
  link: string;
  type: string;
}

export default function ResourceCard({ title, description, tags, link, type }: ResourceCardProps) {
  return (
    <Card className="glass-card hover:border-primary/50 transition-all duration-300">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{type}</Badge>
        </div>
        <h3 className="text-xl font-semibold leading-tight hover:text-primary transition-colors">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => window.open(link, '_blank')}
        >
          Open Resource
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
