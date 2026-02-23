
"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Check, Loader2, Tag, Crown, Calendar } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export function Services() {
  const firestore = useFirestore();

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const dealsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'deals'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const subsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'subscriptions'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: dbServices, isLoading: servicesLoading } = useCollection(servicesQuery);
  const { data: dbDeals, isLoading: dealsLoading } = useCollection(dealsQuery);
  const { data: dbSubs, isLoading: subsLoading } = useCollection(subsQuery);

  // Group services by category
  const categories = ["Haircuts", "Grooming", "Packages"];
  const groupedServices = categories.map(cat => ({
    category: cat,
    items: dbServices?.filter(s => s.category === cat) || []
  })).filter(group => group.items.length > 0);

  // Default fallback if DB is empty
  const defaultServices = [
    {
      category: "Haircuts",
      items: [
        { id: "1", name: "Guild Classic", description: "Tailored scissor or clipper cut including personal consultation.", price: 45, durationMinutes: 45 },
      ]
    }
  ];

  const displayGroups = groupedServices.length > 0 ? groupedServices : defaultServices;

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Premium Services
          </Badge>
          <h2 className="text-4xl md:text-5xl font-headline font-black mb-4">Curated Grooming <span className="text-secondary italic">Menu</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Each service is delivered with an obsession for detail and a commitment to excellence.
          </p>
        </div>

        {/* Dynamic Deals Bar */}
        {dbDeals && dbDeals.length > 0 && (
          <div className="mb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbDeals.map(deal => (
              <div key={deal.id} className="bg-secondary p-6 rounded-2xl text-white flex flex-col gap-6 group overflow-hidden relative shadow-xl shadow-secondary/20 animate-in fade-in slide-in-from-bottom-4">
                <Tag className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Limited Deal</p>
                    <h4 className="text-xl font-bold font-headline">{deal.title}</h4>
                    <p className="text-sm text-white/80 mt-1">{deal.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-3xl font-black">-{deal.discountValue}%</p>
                  </div>
                </div>
                <div className="relative z-10 mt-auto">
                  <Button className="w-full bg-white text-secondary hover:bg-white/90 rounded-lg h-12 flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs">
                    <Calendar className="w-4 h-4" />
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-20">
          {servicesLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
          ) : (
            displayGroups.map((group) => (
              <div key={group.category}>
                <h3 className="text-2xl font-headline font-bold mb-10 flex items-center gap-4">
                  <span className="w-12 h-1 bg-primary rounded-full"></span>
                  {group.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {group.items.map((service: any) => (
                    <Card key={service.id} className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col">
                      <div className="flex-1 p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <CardTitle className="text-2xl font-headline font-bold group-hover:text-primary transition-colors">
                              {service.name}
                            </CardTitle>
                            <span className="text-2xl font-black text-primary">€{service.price}</span>
                          </div>
                          <p className="text-muted-foreground text-base mb-6 leading-relaxed">{service.description}</p>
                          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                              <Clock className="w-3.5 h-3.5 text-secondary" />
                              {service.durationMinutes} mins
                            </span>
                          </div>
                        </div>
                        <div className="mt-8">
                          <Button className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-lg h-12 flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                            <Check className="w-4 h-4" />
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dynamic Subscriptions Section */}
        {dbSubs && dbSubs.length > 0 && (
          <div className="mt-24 pt-24 border-t border-slate-100">
            <div className="text-center mb-16">
              <Badge className="bg-primary mb-4">Guild Memberships</Badge>
              <h2 className="text-4xl font-headline font-black">Join the <span className="text-primary">Elite</span> Club</h2>
              <p className="text-muted-foreground mt-4">Exclusive subscription tiers for our regular distinguished patrons.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dbSubs.map(sub => (
                <div key={sub.id} className="p-10 rounded-3xl border-2 border-slate-100 bg-white hover:border-primary transition-colors shadow-xl group">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Crown className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-headline font-bold">{sub.name}</h4>
                  <p className="text-4xl font-black mt-4 mb-8">€{sub.price}<span className="text-lg font-normal text-slate-400">/mo</span></p>
                  <ul className="space-y-4 mb-10">
                    {sub.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full h-14 bg-slate-900 hover:bg-primary text-white font-bold uppercase tracking-widest">Book Now</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
