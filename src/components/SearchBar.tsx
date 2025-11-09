import { useState, useEffect, useRef } from 'react';
import { Search, User, FileText, Code, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  title: string;
  type: 'post' | 'build' | 'share' | 'user';
  subtitle?: string;
  avatar?: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchPattern = `%${searchQuery}%`;
      
      const [postsData, buildsData, sharesData, usersData] = await Promise.all([
        supabase
          .from('posts')
          .select('id, title, content, users(name)')
          .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
          .limit(3),
        supabase
          .from('builds')
          .select('id, title, description, users(name)')
          .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
          .limit(3),
        supabase
          .from('shares')
          .select('id, title, content')
          .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
          .limit(3),
        supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .or(`username.ilike.${searchPattern},full_name.ilike.${searchPattern}`)
          .limit(3),
      ]);

      const searchResults: SearchResult[] = [];

      // Add posts
      postsData.data?.forEach(post => {
        // @ts-ignore - Supabase generated types issue
        const userName = Array.isArray(post.users) ? post.users[0]?.name : post.users?.name;
        searchResults.push({
          id: post.id,
          title: post.title || 'Untitled Post',
          type: 'post',
          subtitle: userName || 'Anonymous',
        });
      });

      // Add builds
      buildsData.data?.forEach(build => {
        // @ts-ignore - Supabase generated types issue
        const userName = Array.isArray(build.users) ? build.users[0]?.name : build.users?.name;
        searchResults.push({
          id: build.id,
          title: build.title,
          type: 'build',
          subtitle: userName || 'Anonymous',
        });
      });

      // Add shares
      sharesData.data?.forEach(share => {
        searchResults.push({
          id: share.id,
          title: share.title,
          type: 'share',
          subtitle: 'Shared Story',
        });
      });

      // Add users
      usersData.data?.forEach(user => {
        searchResults.push({
          id: user.id,
          title: user.username || user.full_name || 'User',
          type: 'user',
          subtitle: user.full_name || user.username || '',
          avatar: user.avatar_url || undefined,
        });
      });

      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'user':
        navigate(`/profile?userId=${result.id}`);
        break;
      case 'post':
        navigate('/feed');
        break;
      case 'build':
        navigate('/build');
        break;
      case 'share':
        navigate('/share');
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'build':
        return <Code className="h-4 w-4 text-accent" />;
      case 'share':
        return <BookOpen className="h-4 w-4 text-orange-500" />;
      case 'user':
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search Vibe Coders"
        className="w-full pl-11 pr-4 py-2 bg-card border-border rounded-full focus:border-primary transition-colors"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setIsOpen(true)}
      />
      
      {isOpen && (
        <Card className="absolute top-full mt-2 w-full max-h-[500px] overflow-y-auto bg-card border-border z-50 shadow-lg">
          <div className="p-2">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No results found
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(groupedResults).map(([type, items]) => (
                  <div key={type}>
                    <Badge variant="secondary" className="mb-2 text-xs capitalize">
                      {type}s
                    </Badge>
                    <div className="space-y-1">
                      {items.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
                        >
                          {result.type === 'user' ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={result.avatar} />
                              <AvatarFallback>{result.title[0]}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {getIcon(result.type)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{result.title}</p>
                            {result.subtitle && (
                              <p className="text-xs text-muted-foreground truncate">
                                {result.subtitle}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                {results.length >= 5 && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full p-2 text-sm text-primary hover:underline text-center"
                  >
                    View all results
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
