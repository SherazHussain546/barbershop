
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Scissors, Calendar, Sparkles } from "lucide-react";
import { getPlaceholderImage } from "@/app/lib/placeholder-images";

export function Hero() {
  const heroImage = getPlaceholderImage('hero-bg');

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-slate-950">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        {heroImage && (
          <Image 
            src={heroImage.imageUrl} 
            alt={heroImage.description} 
            fill 
            priority
            className="object-cover opacity-40 mix-blend-overlay"
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-background/20 to-secondary/30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-white mb-8 animate-fade-in border border-primary/30 backdrop-blur-sm">
            <Scissors className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.3em]">Est. 2024 • The Elite Standard</span>
          </div>
          
          <h1 className="font-headline text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-[0.95] tracking-tighter">
            Redefining <span className="text-primary italic">Masculine</span> <br/>Elegance.
          </h1>
          
          <p className="font-body text-xl md:text-2xl text-slate-200 mb-12 leading-relaxed max-w-xl font-light">
            Gentlecut Guild is more than a barbershop; it's a sanctuary of style. Experience precision grooming where tradition meets contemporary artistry.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Button size="lg" className="h-20 px-10 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 flex gap-3 uppercase tracking-widest border-0">
              <Calendar className="w-6 h-6" />
              Secure Appointment
            </Button>
            <Button size="lg" variant="outline" className="h-20 px-10 rounded-full text-lg font-bold border-2 border-secondary text-secondary hover:bg-secondary/10 backdrop-blur-md transition-all flex gap-3 uppercase tracking-widest">
              <Sparkles className="w-6 h-6" />
              AI Style Tool
            </Button>
          </div>

          <div className="mt-16 flex items-center gap-10 border-l-4 border-primary pl-8">
            <div>
              <p className="text-3xl font-bold font-headline text-white">5,000+</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Satisfied Clients</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <p className="text-3xl font-bold font-headline text-white">4.9/5.0</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
