import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderImage } from "@/app/lib/placeholder-images";

export function Gallery() {
  const galleryImages = [
    { src: getPlaceholderImage('gallery-1')?.imageUrl, span: "row-span-2" },
    { src: getPlaceholderImage('gallery-2')?.imageUrl, span: "" },
    { src: getPlaceholderImage('gallery-3')?.imageUrl, span: "" },
    { src: getPlaceholderImage('service-shave')?.imageUrl, span: "col-span-2" },
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
          {galleryImages.map((img, i) => (
            <div key={i} className={`relative overflow-hidden rounded-2xl group ${img.span}`}>
              <Image 
                src={img.src || `https://picsum.photos/seed/gallery-${i}/600/800`} 
                alt="Gallery work" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
