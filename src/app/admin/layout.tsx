
'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { 
  Scissors, 
  LayoutDashboard, 
  LogOut, 
  Home, 
  Image as ImageIcon, 
  Users, 
  Briefcase, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AdminLayout(props: { children: React.ReactNode, params: Promise<any> }) {
  use(props.params);
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (!user) {
    return <>{props.children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { href: '/admin/blogs', label: 'Journal', icon: FileText },
    { href: '/admin/services', label: 'Services', icon: Briefcase },
    { href: '/admin/barbers', label: 'Barbers', icon: Users },
    { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <aside className={cn(
        "bg-slate-900 text-white flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className={cn(
          "p-6 border-b border-slate-800 flex items-center transition-all h-20 shrink-0",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
            <div className="p-1.5 bg-primary rounded text-white shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="font-headline font-bold text-xl uppercase tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                Guild <span className="text-primary">Admin</span>
              </span>
            )}
          </Link>
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isCollapsed && (
          <div className="flex justify-center py-4 border-b border-slate-800 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(false)}
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200",
                  isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-4"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-1 duration-300 truncate">{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2 shrink-0">
          <Link href="/">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full text-slate-400 hover:text-white transition-all duration-200",
                isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-4"
              )}
              title={isCollapsed ? "Back to Site" : undefined}
            >
              <Home className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-1 duration-300 truncate">Back to Site</span>}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className={cn(
              "w-full text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all duration-200",
              isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-4"
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-1 duration-300 truncate">Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {props.children}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
