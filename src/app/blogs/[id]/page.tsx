'use client';

import { use } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function BlogPost(props: { params: Promise<{ id: string }>, searchParams: Promise<any> }) {
  const params = use(props.params);
  use(props.searchParams);
  const firestore = useFirestore();
  const { data: blog, isLoading } = useDoc(doc(firestore, 'blogs', params.id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-headline font-bold">Post Not Found</h1>
        <Button asChild variant="outline">
          <Link href="/blogs">Back to Journal</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <article className="flex-grow">
        {/* Hero Header */}
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
          <img src={blog.imageUrl} alt={blog.title} className="absolute inset-0 w-full h-full object-cover grayscale-[20%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-4xl mx-auto px-6 pb-20 w-full">
              <Button variant="ghost" className="text-white hover:bg-white/10 mb-8 p-0 h-auto font-bold uppercase tracking-widest text-xs gap-2" asChild>
                <Link href="/blogs">
                  <ArrowLeft className="w-4 h-4" /> Back to Journal
                </Link>
              </Button>
              <Badge className="bg-primary text-white mb-6 uppercase tracking-[0.2em] px-4 py-1.5 rounded-full text-xs font-bold">Master Knowledge</Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-black text-white leading-[1.1] tracking-tighter uppercase mb-8">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-300 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {blog.publishedAt ? format(blog.publishedAt.toDate(), 'MMMM dd, yyyy') : 'Recently Published'}</span>
                <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Written By {blog.author}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <aside className="lg:col-span-1 flex flex-col gap-4 sticky top-32 h-fit order-2 lg:order-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 rotate-0 lg:-rotate-90 lg:origin-left lg:mb-12">Share Wisdom</p>
              {[Facebook, Twitter, Share2].map((Icon, i) => (
                <Button key={i} variant="outline" size="icon" className="rounded-full border-slate-100 hover:border-primary hover:text-primary transition-all">
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </aside>

            <div className="lg:col-span-11 order-1 lg:order-2">
              <div className="mb-12 p-8 bg-slate-50 border-l-4 border-primary rounded-r-3xl italic text-lg text-slate-600 leading-relaxed font-light">
                "{blog.excerpt}"
              </div>

              {/* Markdown Content (Rendered as styled text for this prototype) */}
              <div className="prose prose-slate prose-xl max-w-none text-slate-700 leading-loose space-y-8 font-body">
                {blog.content.split('\n').map((line, i) => {
                  if (line.startsWith('##')) return <h2 key={i} className="text-3xl font-headline font-bold text-slate-900 mt-12 mb-6 pt-4">{line.replace('## ', '')}</h2>;
                  if (line.startsWith('###')) return <h3 key={i} className="text-2xl font-headline font-bold text-slate-900 mt-8 mb-4">{line.replace('### ', '')}</h3>;
                  if (line.startsWith('*') || line.startsWith('-')) return <li key={i} className="ml-6 list-disc pl-2 mb-2">{line.replace(/^[*|-]\s/, '')}</li>;
                  if (line.trim() === '') return null;
                  return <p key={i} className="mb-6">{line}</p>;
                })}
              </div>

              <div className="mt-20 pt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-headline text-2xl font-black italic">BS</div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Published By</p>
                    <p className="text-lg font-bold text-slate-900">The Barber shop</p>
                  </div>
                </div>
                <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20" asChild>
                  <Link href="/book">Book Your Experience</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
