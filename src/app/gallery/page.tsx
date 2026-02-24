"use client";

import { use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Loader2, ImageIcon } from "lucide-react";

export default function GalleryPage(props: { params: Promise<any>, searchParams: Promise<any> }) {
  use(props.params);
  use(props.searchParams);
  const firestore = useFirestore();

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'galleryImages'), orderBy('uploadedAt', 'desc'));
  }, [firestore]);

  const { data: dbImages, isLoading } = useCollection(galleryQuery);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="py-24 flex-grow bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-primary mb-4 px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              Visual Portfolio
            </Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-black text-slate-900 mb-6 uppercase tracking-tighter">
              The <span className="text-primary italic">Guild</span> Lookbook
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl font-light">
              Explore our latest masterpieces and salon atmosphere. Every image represents our commitment to the art of grooming.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Masterpieces...</p>
            </div>
          ) : !dbImages || dbImages.length === 0 ? (
            <div className="text-center py-40 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <ImageIcon className="w-20 h-20 text-slate-100 mx-auto mb-6" />
              <p className="text-slate-400 text-2xl font-headline italic">The gallery is currently being curated. Check back soon.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {dbImages.map((image) => (
                <div key={image.id} className="relative group overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 break-inside-avoid">
                  <div className="relative aspect-auto">
                    <img 
                      src={image.imageUrl} 
                      alt={image.caption} 
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">Artisan Work</p>
                      <h3 className="text-white text-2xl font-headline font-bold">{image.caption}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
