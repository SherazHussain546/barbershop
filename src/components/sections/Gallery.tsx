
"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderImage } from "@/app/lib/placeholder-images";

export function Gallery() {
  const galleryItems = [
    { image: getPlaceholderImage('gallery-1'), span: "row-span-2" },
    { image: getPlaceholderImage('gallery-2'), span: "" },
    { image: getPlaceholderImage('gallery-3'), span: "" },
    { image: getPlaceholderImage('service-shave'), span: "col-span-2" },
  ];

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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px] md:auto-rows-[300px]">
          {galleryItems.map((item, i) => (
            <div key={i} className={`relative overflow-hidden rounded-2xl group ${item.span}`}>
              {item.image ? (
                <Image 
                  src={item.image.imageUrl} 
                  alt={item.image.description} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint={item.image.imageHint}
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                   <span className="text-slate-400 text-xs font-bold uppercase">Image Loading...</span>
                </div>
              )}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
