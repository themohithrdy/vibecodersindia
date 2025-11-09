import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EditProfileDialog from '@/components/EditProfileDialog';
import { FollowButton } from '@/components/FollowButton';
import CommunityPostCard from '@/components/CommunityPostCard';
import BuildCard from '@/components/BuildCard';
import StoryCard from '@/components/StoryCard';
import { useAuth } from '@/contexts/AuthContext';
import { useFollow } from '@/hooks/useFollow';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Edit, Grid } from 'lucide-react';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const profileUserId = searchParams.get('userId') || user?.id;
  const { profile, stats, isLoading, refetch } = useProfile(profileUserId || '');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { followersCount, followingCount } = useFollow(profileUserId || '');
  const isOwnProfile = user?.id === profileUserId;

  const [posts, setPosts] = useState<any[]>([]);
  const [builds, setBuilds] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (!profileUserId) return;
      
      setContentLoading(true);
      try {
        const [postsData, buildsData, sharesData] = await Promise.all([
          supabase
            .from('posts')
            .select('*, users(name, avatar_url)')
            .eq('user_id', profileUserId)
            .order('created_at', { ascending: false }),
          supabase
            .from('builds')
            .select('*, users(name, avatar_url)')
            .eq('user_id', profileUserId)
            .order('created_at', { ascending: false }),
          supabase
            .from('shares')
            .select('*')
            .eq('user_id', profileUserId)
            .order('created_at', { ascending: false }),
        ]);

        setPosts(postsData.data || []);
        setBuilds(buildsData.data || []);
        setShares(sharesData.data || []);

        if (isOwnProfile) {
          const { data: savedData } = await supabase
            .from('saved_items')
            .select(`
              *,
              posts(*),
              builds(*),
              shares(*)
            `)
            .eq('user_id', profileUserId)
            .order('created_at', { ascending: false });

          setSavedItems(savedData || []);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setContentLoading(false);
      }
    };

    fetchContent();
  }, [profileUserId, isOwnProfile]);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1 space-y-4 w-full">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-4 w-full max-w-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Login to View Profile</h2>
            <p className="text-muted-foreground text-lg">
              Sign in to access your profile and manage your content
            </p>
          </div>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Log In
          </Button>
        </div>
      </Layout>
    );
  }

  const joinedDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header - Instagram Style */}
        <Card className="glass-card">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Avatar */}
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-4xl">
                  {profile?.username?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Profile Info */}
              <div className="flex-1 space-y-5 w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <h1 className="text-2xl font-semibold">{profile?.username || profile?.full_name || 'User'}</h1>
                  {isOwnProfile ? (
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditDialogOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : profileUserId ? (
                    <FollowButton userId={profileUserId} />
                  ) : null}
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-8 text-base">
                  <div>
                    <span className="font-semibold">{stats.postsCount}</span>{' '}
                    <span className="text-muted-foreground">posts</span>
                  </div>
                  <button className="hover:text-foreground transition-colors">
                    <span className="font-semibold">{followersCount}</span>{' '}
                    <span className="text-muted-foreground">
                      {followersCount === 1 ? 'follower' : 'followers'}
                    </span>
                  </button>
                  <button className="hover:text-foreground transition-colors">
                    <span className="font-semibold">{followingCount}</span>{' '}
                    <span className="text-muted-foreground">following</span>
                  </button>
                </div>

                {/* Bio and Info */}
                <div className="space-y-2">
                  <p className="font-semibold">{profile?.full_name}</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {profile?.bio || (isOwnProfile ? 'Add a bio to tell people about yourself.' : 'No bio yet.')}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="glass-card w-full justify-center border-t">
            <TabsTrigger value="posts" className="flex-1 data-[state=active]:border-t-2 data-[state=active]:border-foreground">
              <Grid className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="builds" className="flex-1 data-[state=active]:border-t-2 data-[state=active]:border-foreground">
              <Grid className="h-4 w-4 mr-2" />
              Builds
            </TabsTrigger>
            <TabsTrigger value="shares" className="flex-1 data-[state=active]:border-t-2 data-[state=active]:border-foreground">
              <Grid className="h-4 w-4 mr-2" />
              Shares
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="saved" className="flex-1 data-[state=active]:border-t-2 data-[state=active]:border-foreground">
                <Grid className="h-4 w-4 mr-2" />
                Saved
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    title={post.title || 'Untitled'}
                    content={post.content || ''}
                    author={post.users?.name || 'Anonymous'}
                    authorAvatar={post.users?.avatar_url}
                    tags={[post.category || 'General']}
                    useful={0}
                    learned={0}
                    comments={0}
                  />
                ))}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="py-12">
                  <p className="text-muted-foreground text-center">
                    {isOwnProfile ? 'No posts yet. Start sharing your thoughts!' : 'No posts yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="builds" className="mt-6">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
              </div>
            ) : builds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {builds.map((build) => (
                  <BuildCard
                    key={build.id}
                    id={build.id}
                    title={build.title}
                    description={build.description}
                    users={build.users}
                    tags={build.tags || []}
                    stars={build.stars || 0}
                    status={build.status}
                    github_url={build.github_url}
                    live_url={build.live_url}
                  />
                ))}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="py-12">
                  <p className="text-muted-foreground text-center">
                    {isOwnProfile ? 'No builds yet. Start creating!' : 'No builds yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="shares" className="mt-6">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
              </div>
            ) : shares.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shares.map((share) => (
                  <StoryCard
                    key={share.id}
                    title={share.title}
                    content={share.content || ''}
                    author={profile?.username || profile?.full_name || 'User'}
                    authorAvatar={profile?.avatar_url || undefined}
                    tags={share.tags || []}
                    learned={0}
                    inspired={0}
                    loved={0}
                    comments={0}
                  />
                ))}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="py-12">
                  <p className="text-muted-foreground text-center">
                    {isOwnProfile ? 'No shared content yet.' : 'No shared content yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="saved" className="mt-6">
              {contentLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
                </div>
              ) : savedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedItems.map((item) => {
                    if (item.posts) {
                      return (
                        <CommunityPostCard
                          key={item.id}
                          title={item.posts.title}
                          content={item.posts.content}
                          author="Saved Post"
                          tags={[item.posts.category || 'General']}
                          useful={0}
                          learned={0}
                          comments={0}
                        />
                      );
                    }
                    if (item.builds) {
                      return (
                        <BuildCard
                          key={item.id}
                          id={item.builds.id}
                          title={item.builds.title}
                          description={item.builds.description}
                          users={null}
                          tags={item.builds.tags || []}
                          stars={item.builds.stars || 0}
                          status={item.builds.status}
                          github_url={item.builds.github_url}
                          live_url={item.builds.live_url}
                        />
                      );
                    }
                    if (item.shares) {
                      return (
                        <StoryCard
                          key={item.id}
                          title={item.shares.title}
                          content={item.shares.content || ''}
                          author="Saved Share"
                          tags={item.shares.tags || []}
                          learned={0}
                          inspired={0}
                          loved={0}
                          comments={0}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <Card className="glass-card">
                  <CardContent className="py-12">
                    <p className="text-muted-foreground text-center">
                      No saved items yet. Start saving content you like!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {profile && (
        <EditProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profile={{
            name: profile.full_name || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || ''
          }}
          onProfileUpdate={refetch}
        />
      )}
    </Layout>
  );
}
