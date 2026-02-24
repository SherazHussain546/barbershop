"use client";

import { use, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Loader2, ImageIcon, Maximize2, Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function GalleryPage(props: { params: Promise<any>, searchParams: Promise<any> }) {
  use(props.params);
  use(props.searchParams);
  const firestore = useFirestore();
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'galleryImages'), orderBy('uploadedAt', 'desc'));
  }, [firestore]);

  const { data: dbImages, isLoading } = useCollection(galleryQuery);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'barbershop-style.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              The <span className="text-primary italic">Shop</span> Lookbook
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl font-light">
              Explore our latest masterpieces and shop atmosphere. Every image represents our commitment to the art of grooming.
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
                <div 
                  key={image.id} 
                  className="relative group overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 break-inside-avoid cursor-zoom-in"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative aspect-auto">
                    <img 
                      src={image.imageUrl} 
                      alt={image.caption} 
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                    <div className="w-full flex justify-between items-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div>
                        <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">Artisan Work</p>
                        <h3 className="text-white text-2xl font-headline font-bold">{image.caption}</h3>
                      </div>
                      <div className="bg-white/10 p-2 rounded-full backdrop-blur-md text-white border border-white/20">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Image Preview Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 border-none bg-black/95 overflow-hidden rounded-[2rem]">
          {selectedImage && (
            <div className="relative flex flex-col md:flex-row h-full max-h-[90vh]">
              <div className="flex-1 bg-black flex items-center justify-center p-4">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.caption} 
                  className="max-w-full max-h-[70vh] md:max-h-full object-contain"
                />
              </div>
              <div className="bg-white md:w-80 p-8 flex flex-col justify-between">
                <div>
                  <DialogHeader className="mb-6">
                    <p className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">Shop Masterpiece</p>
                    <DialogTitle className="text-2xl font-headline font-bold text-slate-900 leading-tight">
                      {selectedImage.caption}
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 italic">
                    "Precision is not just our technique, it's our philosophy. This look represents the intersection of tradition and modern artistry."
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.caption)}
                    className="w-full h-14 bg-slate-900 hover:bg-primary text-white font-bold uppercase tracking-widest gap-3 rounded-2xl transition-all shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Download Image
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full h-14 border-2 rounded-2xl font-bold uppercase tracking-widest text-slate-400">
                      Close Preview
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}
