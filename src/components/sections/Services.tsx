
"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Check } from "lucide-react";
import Image from "next/image";
import { getPlaceholderImage } from "@/app/lib/placeholder-images";

export function Services() {
  const services = [
    {
      category: "Haircuts",
      items: [
        {
          id: "classic-cut",
          name: "Guild Classic",
          description: "Tailored scissor or clipper cut including personal consultation, hot towel finish, and signature styling.",
          price: "$45",
          duration: "45 mins",
          featured: true,
        },
        {
          id: "buzz-cut",
          name: "The Precision Buzz",
          description: "Clean, even clipper cut all over with precise line-up and neck shave.",
          price: "$30",
          duration: "30 mins",
        },
      ]
    },
    {
      category: "Grooming",
      items: [
        {
          id: "hot-shave",
          name: "Traditional Shave",
          description: "Multi-step hot towel treatment, pre-shave oil, straight razor shave, and cooling post-shave balm.",
          price: "$55",
          duration: "60 mins",
          featured: true,
          image: getPlaceholderImage('service-shave')?.imageUrl
        },
        {
          id: "beard-trim",
          name: "Beard Sculpting",
          description: "Professional beard shaping and line-up using clippers and straight razor edge.",
          price: "$35",
          duration: "30 mins",
        },
      ]
    }
  ];

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

        <div className="grid gap-16">
          {services.map((group) => (
            <div key={group.category}>
              <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-4">
                <span className="w-12 h-1 bg-primary rounded-full"></span>
                {group.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {group.items.map((service) => (
                  <Card key={service.id} className={`overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col md:flex-row ${service.featured ? 'ring-2 ring-primary/20' : ''}`}>
                    {service.image && (
                      <div className="relative w-full md:w-1/3 min-h-[200px]">
                        <Image 
                          src={service.image} 
                          alt={service.name} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl font-headline font-bold group-hover:text-primary transition-colors">
                            {service.name}
                          </CardTitle>
                          <span className="text-xl font-black text-primary">{service.price}</span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{service.description}</p>
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-secondary" />
                            {service.duration}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-lg flex items-center gap-2 group-hover:translate-y-[-2px] transition-transform">
                          <Check className="w-4 h-4" />
                          Book This Service
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
