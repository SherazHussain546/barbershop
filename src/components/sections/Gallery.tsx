
"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Loader2, ImageIcon, ArrowRight } from "lucide-react";
import { getPlaceholderImage } from "@/app/lib/placeholder-images";

export function Gallery() {
  const firestore = useFirestore();

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'galleryImages'), orderBy('uploadedAt', 'desc'), limit(5));
  }, [firestore]);

  const { data: dbImages, isLoading } = useCollection(galleryQuery);

  // Fallback items if database is empty
  const placeholderItems = [
    { imageUrl: getPlaceholderImage('gallery-1')?.imageUrl || "", caption: "Sharp lines and style", span: "row-span-2" },
    { imageUrl: getPlaceholderImage('gallery-2')?.imageUrl || "", caption: "Professional beard grooming", span: "" },
    { imageUrl: getPlaceholderImage('gallery-3')?.imageUrl || "", caption: "Classic scissor cut", span: "" },
    { imageUrl: getPlaceholderImage('service-shave')?.imageUrl || "", caption: "Signature Hot Shave", span: "col-span-2" },
  ];

  const displayImages = dbImages && dbImages.length > 0 
    ? dbImages.map((img, idx) => ({
        imageUrl: img.imageUrl,
        caption: img.caption,
        span: idx === 0 ? "row-span-2" : idx === 3 ? "col-span-2" : ""
      }))
    : placeholderItems;

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-secondary text-secondary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            The Gallery
          </Badge>
          <h2 className="text-4xl md:text-5xl font-headline font-black">Visual <span className="text-primary">Portfolio</span></h2>
          <p className="mt-4 text-muted-foreground text-lg">A glimpse into the precision and passion we bring to every chair.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px] md:auto-rows-[300px]">
              {displayImages.map((item, i) => (
                <div key={i} className={`relative overflow-hidden rounded-2xl group ${item.span}`}>
                  <Image 
                    src={item.imageUrl} 
                    alt={item.caption} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <p className="text-white font-bold text-sm tracking-widest uppercase">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button asChild variant="outline" size="lg" className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold uppercase tracking-widest px-10 h-14 transition-all duration-300 group">
                <Link href="/gallery" className="flex items-center gap-2">
                  View Full Lookbook
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
