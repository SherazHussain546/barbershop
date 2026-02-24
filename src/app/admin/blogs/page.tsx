
'use client';

import { useState, use } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, serverTimestamp, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, Loader2, Sparkles, Send, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { generateBlog } from '@/ai/flows/generate-blog-flow';

export default function BlogManagement(props: { params: Promise<any>, searchParams: Promise<any> }) {
  use(props.params);
  use(props.searchParams);
  const { toast } = useToast();
  const firestore = useFirestore();

  // Blog State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('');
  
  // AI Flow State
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const blogsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogs'), orderBy('publishedAt', 'desc'));
  }, [firestore]);

  const { data: blogs, isLoading } = useCollection(blogsQuery);

  const handleGenerateWithAI = async () => {
    if (!aiTopic) {
      toast({ variant: "destructive", title: "Missing Topic", description: "Please enter a topic for the AI to write about." });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateBlog({ 
        topic: aiTopic, 
        targetAudience: "Modern Gentlemen & Professionals",
        keywords: ["Grooming", "Style", "Barbershop", "Craftsmanship"]
      });
      
      setTitle(response.title);
      setExcerpt(response.excerpt);
      setContent(response.content);
      setSlug(response.suggestedSlug);
      setAuthor("Guild Master AI");
      toast({ title: "Draft Generated", description: "AI has crafted a new masterpiece for you to review." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate blog post." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !title || !content || !slug) return;

    setIsAdding(true);
    const blogData = {
      title,
      excerpt,
      content,
      slug,
      author,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200',
      publishedAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(firestore, 'blogs'), blogData);
      toast({ title: "Published", description: "Your post is now live in the journal." });
      resetForm();
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'blogs', operation: 'create', requestResourceData: blogData }));
    } finally {
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setExcerpt(''); setContent(''); setSlug(''); setAuthor(''); setImageUrl(''); setAiTopic('');
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'blogs', id));
      toast({ title: "Removed", description: "Blog post deleted." });
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `blogs/${id}`, operation: 'delete' }));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-bold text-slate-900">Guild Journal</h1>
        <p className="text-slate-500 mt-1">Manage blog posts and use AI to craft compelling grooming stories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Section */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-md rounded-2xl">
            <CardHeader className="bg-slate-950 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-headline">Post Architect</CardTitle>
                  <CardDescription className="text-slate-400">Craft or generate your next journal entry.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="AI Topic (e.g., Beard care in winter)" 
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 w-64 h-10"
                  />
                  <Button 
                    disabled={isGenerating} 
                    onClick={handleGenerateWithAI}
                    className="bg-primary hover:bg-primary/90 gap-2 h-10"
                  >
                    {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    AI Craft
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="The Art of the Scissor Cut" className="h-12 border-2" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Slug (URL)</Label>
                  <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="scissor-cut-art" className="h-12 border-2" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Author</Label>
                  <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Marcus Aurelius" className="h-12 border-2" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Featured Image URL</Label>
                  <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="h-12 border-2" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Excerpt (SEO Description)</Label>
                <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short summary..." className="border-2 min-h-[80px]" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Journal Content (Markdown)</Label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your story here..." className="border-2 min-h-[400px] font-mono text-sm" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={resetForm} className="rounded-xl h-12 px-8 uppercase tracking-widest text-xs font-bold">Clear Draft</Button>
                <Button 
                  onClick={handlePublish} 
                  disabled={isAdding || !title || !content} 
                  className="bg-slate-900 rounded-xl h-12 px-10 uppercase tracking-widest text-xs font-bold gap-2"
                >
                  {isAdding ? <Loader2 className="animate-spin" /> : <Send className="w-4 h-4" />}
                  Publish Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List Section */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-md rounded-2xl h-fit">
            <CardHeader>
              <CardTitle className="text-xl font-headline">Active Journal</CardTitle>
              <CardDescription>Review and manage your live posts.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[800px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                ) : !blogs || blogs.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 italic">No posts published yet.</div>
                ) : (
                  blogs.map(blog => (
                    <div key={blog.id} className="p-6 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-1">{blog.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">By {blog.author}</p>
                          <div className="flex gap-2 mt-3">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">
                              {blog.slug}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(blog.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" asChild>
                            <a href={`/blogs/${blog.id}`} target="_blank"><Eye className="w-4 h-4" /></a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
