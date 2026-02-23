
import Link from "next/link";
import { Scissors, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-primary rounded-lg text-white">
                <Scissors className="w-6 h-6" />
              </div>
              <span className="font-headline text-2xl font-black tracking-tight uppercase">
                Gentlecut <span className="text-primary">Guild</span>
              </span>
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              The premier destination for the modern man. Precision grooming, timeless styling, and an unparalleled atmosphere in the heart of the city.
            </p>
            <div className="flex gap-4 mt-8">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <Link key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-headline font-bold mb-6 text-primary uppercase tracking-widest">Visit Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-secondary shrink-0" />
                <span>123 Gentleman's Row, Suite 101<br />New York, NY 10001</span>
              </li>
              <li className="flex gap-3 text-slate-400">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span>+1 (212) 555-0123</span>
              </li>
              <li className="flex gap-3 text-slate-400">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span>guild@gentlecut.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-headline font-bold mb-6 text-primary uppercase tracking-widest">Hours</h4>
            <ul className="space-y-3 text-slate-400">
              <li className="flex justify-between">
                <span>Mon - Fri</span>
                <span className="text-white font-bold">9am - 8pm</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="text-white font-bold">10am - 6pm</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-white font-bold">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>© 2024 Gentlecut Guild. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
