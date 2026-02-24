
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Services", href: "/#services" },
    { name: "Barbers", href: "/#barbers" },
    { name: "Journal", href: "/blogs" },
    { name: "AI Stylist", href: "/#ai-stylist" },
    { name: "Gallery", href: "/gallery" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground transform group-hover:rotate-12 transition-transform duration-300">
              <Scissors className="w-6 h-6" />
            </div>
            <span className="font-headline text-2xl font-black tracking-tight text-foreground uppercase">
              Gentlecut <span className="text-primary">Guild</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-wide uppercase"
              >
                {link.name}
              </Link>
            ))}
            <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-6 font-bold uppercase tracking-wider" asChild>
              <Link href="/book">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-4 text-base font-bold text-foreground border-b border-border/50 hover:text-primary transition-colors tracking-wide uppercase"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-6 text-lg font-bold uppercase tracking-wider" asChild>
                <Link href="/book">Book Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
