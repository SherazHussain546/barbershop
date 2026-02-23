
import { Button } from "@/components/ui/button";
import { Scissors, Calendar, Sparkles } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/app/lib/placeholder-images";

export function Hero() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage?.imageUrl || ""}
          alt="Barbershop Atmosphere"
          fill
          className="object-cover"
          priority
          data-ai-hint="barber shop interior"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent md:to-background/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in">
            <Scissors className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Est. 2024 • The Elite Standard</span>
          </div>
          
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-black text-foreground mb-6 leading-[1.1]">
            Redefining <span className="text-primary italic">Masculine</span> Elegance.
          </h1>
          
          <p className="font-body text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
            Gentlecut Guild is more than a barbershop; it's a sanctuary of style. Experience precision grooming where tradition meets contemporary artistry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="h-16 px-8 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex gap-3 uppercase tracking-wider">
              <Calendar className="w-5 h-5" />
              Secure Appointment
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-8 rounded-full text-lg font-bold border-2 hover:bg-secondary hover:text-white transition-all flex gap-3 uppercase tracking-wider">
              <Sparkles className="w-5 h-5" />
              AI Style Tool
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-6 border-l-4 border-primary pl-6">
            <div>
              <p className="text-2xl font-bold font-headline">5000+</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Satisfied Clients</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-bold font-headline">4.9/5.0</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
