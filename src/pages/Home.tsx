import { useState } from 'react';
import Layout from '@/components/Layout';
import RightSidebar from '@/components/RightSidebar';
import NewsCard from '@/components/NewsCard';
import ResourceCard from '@/components/ResourceCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const aiNews = [
  {
    title: 'OpenAI Releases GPT-5 with Enhanced Reasoning',
    excerpt: 'The latest iteration brings unprecedented improvements in logical reasoning and code generation capabilities.',
    source: 'TechCrunch',
    category: 'AI Models',
    likes: 342,
    comments: 56,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  },
  {
    title: 'India\'s AI Adoption Grows 45% in 2024',
    excerpt: 'New report shows Indian companies leading in AI implementation across industries.',
    source: 'Business Standard',
    category: 'Industry',
    likes: 228,
    comments: 34,
    imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop',
  },
  {
    title: 'Google Gemini 2.0 Launches with Multimodal Capabilities',
    excerpt: 'New AI model processes text, images, audio, and video with state-of-the-art performance.',
    source: 'Google AI Blog',
    category: 'AI Models',
    likes: 412,
    comments: 78,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
  },
  {
    title: 'Meta Releases Llama 3.1 for Commercial Use',
    excerpt: 'Open-source language model rivaling GPT-4, now available for enterprise applications.',
    source: 'Meta AI',
    category: 'AI Models',
    likes: 567,
    comments: 92,
    imageUrl: 'https://images.unsplash.com/photo-1655721532427-58068dc46e27?w=800&h=400&fit=crop',
  },
  {
    title: 'AI Coding Assistants Transform Software Development',
    excerpt: 'GitHub Copilot and competitors are changing how developers write code, boosting productivity by 40%.',
    source: 'InfoWorld',
    category: 'Tools',
    likes: 289,
    comments: 45,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
  },
  {
    title: 'Anthropic\'s Claude 3 Sets New Benchmarks',
    excerpt: 'Claude 3 achieves state-of-the-art results across reasoning, math, and coding tasks.',
    source: 'Anthropic',
    category: 'AI Models',
    likes: 345,
    comments: 67,
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop',
  },
  {
    title: 'AI in Healthcare: Diagnosing Diseases Earlier',
    excerpt: 'Machine learning models detect cancer and other diseases with accuracy surpassing human doctors.',
    source: 'Nature Medicine',
    category: 'Research',
    likes: 456,
    comments: 89,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop',
  },
  {
    title: 'Stable Diffusion XL Revolutionizes Image Generation',
    excerpt: 'Latest version produces photorealistic images with better composition and detail.',
    source: 'Stability AI',
    category: 'Tools',
    likes: 523,
    comments: 112,
    imageUrl: 'https://images.unsplash.com/photo-1686191128892-3b5c076775d8?w=800&h=400&fit=crop',
  },
];

const aiResources = [
  {
    title: 'Complete Guide to Prompt Engineering',
    description: 'Master the art of crafting effective prompts for ChatGPT, Claude, and other LLMs.',
    tags: ['Prompting', 'LLMs', 'Tutorial'],
    link: 'https://www.promptingguide.ai/',
    type: 'Tutorial',
  },
  {
    title: 'Hugging Face Transformers Library',
    description: 'State-of-the-art NLP models and tools for easy implementation in your projects.',
    tags: ['NLP', 'Python', 'Models'],
    link: 'https://huggingface.co/docs/transformers',
    type: 'Documentation',
  },
  {
    title: 'LangChain Framework Guide',
    description: 'Build powerful applications with LLMs using chains, agents, and memory.',
    tags: ['LangChain', 'Python', 'Framework'],
    link: 'https://python.langchain.com/',
    type: 'Framework',
  },
  {
    title: 'Fast.ai Deep Learning Course',
    description: 'Free course covering practical deep learning for coders with hands-on projects.',
    tags: ['Deep Learning', 'Course', 'Free'],
    link: 'https://course.fast.ai/',
    type: 'Course',
  },
  {
    title: 'OpenAI API Cookbook',
    description: 'Example code and guides for building with OpenAI\'s GPT models.',
    tags: ['OpenAI', 'API', 'Examples'],
    link: 'https://cookbook.openai.com/',
    type: 'Documentation',
  },
  {
    title: 'Papers With Code',
    description: 'Browse state-of-the-art ML papers with code implementations and benchmarks.',
    tags: ['Research', 'Papers', 'Code'],
    link: 'https://paperswithcode.com/',
    type: 'Research',
  },
  {
    title: 'Midjourney Prompt Guide',
    description: 'Learn to create stunning AI art with advanced prompting techniques.',
    tags: ['Midjourney', 'Art', 'Prompting'],
    link: 'https://docs.midjourney.com/',
    type: 'Guide',
  },
  {
    title: 'Google AI Studio',
    description: 'Experiment with Google\'s Gemini models and build AI applications.',
    tags: ['Google', 'Gemini', 'Platform'],
    link: 'https://ai.google.dev/',
    type: 'Tool',
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibleNewsCount, setVisibleNewsCount] = useState(6);
  const [visibleResourcesCount, setVisibleResourcesCount] = useState(6);

  const filteredNews = aiNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          news.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || news.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredResources = aiResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
  return (
    <Layout rightSidebar={<RightSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome to VCI 🔥</h1>
          <p className="text-muted-foreground text-lg">
            Learn → Build → Share — Join India's vibrant AI creator community
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search AI news, resources, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="AI Models">AI Models</SelectItem>
              <SelectItem value="Tools">Tools</SelectItem>
              <SelectItem value="Industry">Industry</SelectItem>
              <SelectItem value="Research">Research</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="news" className="w-full">
          <TabsList className="glass-card">
            <TabsTrigger value="news">AI News</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="news" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.slice(0, visibleNewsCount).map((news, idx) => (
                <NewsCard key={idx} {...news} />
              ))}
            </div>
            
            {filteredNews.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No news found matching your search.</p>
              </div>
            )}

            {visibleNewsCount < filteredNews.length && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setVisibleNewsCount(prev => prev + 6)}
                  variant="outline"
                  size="lg"
                >
                  Load More News
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-6 mt-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">AI Resources & Tutorials</h2>
              <p className="text-muted-foreground mb-6">
                Curated collection of tools, tutorials, and guides to accelerate your AI journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.slice(0, visibleResourcesCount).map((resource, idx) => (
                <ResourceCard key={idx} {...resource} />
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No resources found matching your search.</p>
              </div>
            )}

            {visibleResourcesCount < filteredResources.length && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setVisibleResourcesCount(prev => prev + 6)}
                  variant="outline"
                  size="lg"
                >
                  Load More Resources
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
