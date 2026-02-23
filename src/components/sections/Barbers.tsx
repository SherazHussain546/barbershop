"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scissors, Instagram, Loader2 } from "lucide-react";
import { getPlaceholderImage } from "@/app/lib/placeholder-images";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export function Barbers() {
  const firestore = useFirestore();

  const barbersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'barbers'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: dbBarbers, isLoading } = useCollection(barbersQuery);

  // Fallback barbers if database is empty
  const placeholderBarbers = [
    {
      id: "marcus",
      name: "Marcus Aurelius",
      role: "Master Barber",
      instagramUrl: "#",
      profileImageUrl: getPlaceholderImage('barber-1')?.imageUrl || ""
    },
    {
      id: "elena",
      name: "Elena Vance",
      role: "Senior Stylist",
      instagramUrl: "#",
      profileImageUrl: getPlaceholderImage('barber-2')?.imageUrl || ""
    },
    {
      id: "james",
      name: "James Sterling",
      role: "Junior Barber",
      instagramUrl: "#",
      profileImageUrl: getPlaceholderImage('barber-3')?.imageUrl || ""
    }
  ];

  const displayBarbers = dbBarbers && dbBarbers.length > 0 ? dbBarbers : placeholderBarbers;

  return (
    <section id="barbers" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <Badge className="bg-secondary mb-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Our Artisans
            </Badge>
            <h2 className="text-4xl md:text-5xl font-headline font-black">Meet the <span className="text-primary">Guild Masters</span></h2>
            <p className="mt-4 text-muted-foreground text-lg">Our barbers are more than technicians; they are craftsmen dedicated to the art of grooming.</p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2 border-2 hover:bg-primary hover:text-white transition-all">
            <Scissors className="w-4 h-4" />
            Join the Team
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {displayBarbers.map((barber) => (
              <div key={barber.id} className="group relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-xl">
                  <Image 
                    src={barber.profileImageUrl} 
                    alt={barber.name} 
                    fill 
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-4">
                      <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-md hover:bg-primary transition-colors" asChild>
                        <a href={barber.instagramUrl} target="_blank" rel="noopener noreferrer">
                          <Instagram className="w-4 h-4 text-white" />
                        </a>
                      </Button>
                    </div>
                    <Button className="w-full bg-white text-black hover:bg-primary hover:text-white font-bold uppercase tracking-widest text-xs" asChild>
                      <a href={barber.instagramUrl} target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6 text-center md:text-left">
                  <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">{barber.role}</p>
                  <h3 className="text-2xl font-headline font-bold group-hover:text-primary transition-colors mb-2">{barber.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
