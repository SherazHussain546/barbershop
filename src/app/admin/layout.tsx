'use client';

import React from 'react';
import Link from 'next/link';
import { Scissors, LayoutDashboard, Briefcase, Users, Calendar, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded text-white">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="font-headline font-bold text-xl uppercase tracking-tight">
              Guild <span className="text-primary">Admin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-800 text-slate-300 hover:text-white">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/services">
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-800 text-slate-300 hover:text-white">
              <Briefcase className="w-4 h-4" />
              Services
            </Button>
          </Link>
          <Link href="/admin/barbers">
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-800 text-slate-300 hover:text-white">
              <Users className="w-4 h-4" />
              Artisans
            </Button>
          </Link>
          <Link href="/admin/appointments">
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-800 text-slate-300 hover:text-white">
              <Calendar className="w-4 h-4" />
              Appointments
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white">
              <Home className="w-4 h-4" />
              Back to Site
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/30"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
