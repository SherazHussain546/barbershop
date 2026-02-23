
import { Button } from "@/components/ui/button";
import { Scissors, Calendar, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-slate-950">
      {/* Background Overlay / Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/10 to-secondary/20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in border border-primary/20">
            <Scissors className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Est. 2024 • The Elite Standard</span>
          </div>
          
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.1]">
            Redefining <span className="text-primary italic">Masculine</span> Elegance.
          </h1>
          
          <p className="font-body text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-lg">
            Gentlecut Guild is more than a barbershop; it's a sanctuary of style. Experience precision grooming where tradition meets contemporary artistry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="h-16 px-8 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex gap-3 uppercase tracking-wider">
              <Calendar className="w-5 h-5" />
              Secure Appointment
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-8 rounded-full text-lg font-bold border-2 border-white/20 text-white hover:bg-white/10 transition-all flex gap-3 uppercase tracking-wider">
              <Sparkles className="w-5 h-5" />
              AI Style Tool
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-6 border-l-4 border-primary pl-6 text-white">
            <div>
              <p className="text-2xl font-bold font-headline text-white">5000+</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Satisfied Clients</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold font-headline text-white">4.9/5.0</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
