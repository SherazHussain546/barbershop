'use client';

import { use } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, User, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function BlogListing(props: { params: Promise<any>, searchParams: Promise<any> }) {
  use(props.params);
  use(props.searchParams);
  const firestore = useFirestore();

  const blogsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogs'), orderBy('publishedAt', 'desc'));
  }, [firestore]);

  const { data: blogs, isLoading } = useCollection(blogsQuery);

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <section className="py-24 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="bg-primary mb-4 px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">Style Journal</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-black text-slate-900 mb-6 uppercase tracking-tighter">
              Timeless <span className="text-primary italic">Style</span> & Wisdom
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl font-light">
              Grooming tips, heritage insights, and modern lifestyle advice from the masters of our shop.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Reviewing the archives...</p>
            </div>
          ) : !blogs || blogs.length === 0 ? (
            <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <FileText className="w-20 h-20 text-slate-100 mx-auto mb-6" />
              <p className="text-slate-400 text-2xl font-headline italic">The journal is currently empty. Check back soon for new wisdom.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {blogs.map((blog) => (
                <Card key={blog.id} className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden group bg-white">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={blog.imageUrl} 
                      alt={blog.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                      <Badge className="bg-primary text-white font-bold px-4 py-1.5 rounded-full uppercase tracking-tighter text-[10px]">
                        Read Entry
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-10 space-y-6">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> {blog.publishedAt ? format(blog.publishedAt.toDate(), 'MMM dd, yyyy') : 'Recently'}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-primary" /> By {blog.author}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-headline font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight mb-4">
                        {blog.title}
                      </h2>
                      <p className="text-slate-500 line-clamp-3 text-sm leading-relaxed italic">
                        "{blog.excerpt}"
                      </p>
                    </div>
                    <Button variant="ghost" className="p-0 h-auto font-bold text-primary uppercase tracking-widest text-xs gap-2 group/btn" asChild>
                      <Link href={`/blogs/${blog.id}`}>
                        Explore Post
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
