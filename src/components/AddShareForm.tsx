import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title too long'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const suggestedTags = [
  'Lesson Learned',
  'Success Story',
  'Failure',
  'Tips',
  'Experience',
  'Best Practices',
  'Challenge',
];

export default function AddShareForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadImage, uploading } = useImageUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else if (tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to share your story',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile, 'share-images');
        if (!imageUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      // Insert share
      // @ts-ignore
      const { error } = await supabase
        .from('shares')
        .insert({
          title: data.title,
          content: data.content,
          tags: tags.length > 0 ? tags : null,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your story has been shared successfully',
      });

      navigate('/share');
    } catch (error: any) {
      console.error('Error creating share:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to share story',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to share your story
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Share Your Story</CardTitle>
          <CardDescription>
            Share your experiences, lessons learned, and insights with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., How I Built My First AI App"
                {...register('title')}
                disabled={isSubmitting || uploading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Your Story *</Label>
              <Textarea
                id="content"
                placeholder="Share your experience, what you learned, challenges you faced..."
                rows={10}
                {...register('content')}
                disabled={isSubmitting || uploading}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags (Max 5)</Label>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={tags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t">
                  <p className="text-sm text-muted-foreground w-full">Selected tags:</p>
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || uploading}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Share Story
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/share')}
                disabled={isSubmitting || uploading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
