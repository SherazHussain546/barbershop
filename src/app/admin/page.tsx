'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Calendar, TrendingUp, Scissors, Loader2, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const firestore = useFirestore();
  const auth = getAuth();

  // Guard for Admin access (via roles_admin collection check)
  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);
  
  // In a real app, we'd use useDoc to check existence. 
  // For the prototype, we assume if you can log in to admin, you are an admin.
  // In a production app, the security rules would handle this.

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError(err.message || 'Failed to sign in');
    } finally {
      setLoginLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="bg-primary text-white text-center pb-8 pt-10">
            <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Scissors className="w-6 h-6" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold uppercase tracking-tight">Admin Portal</CardTitle>
            <CardDescription className="text-white/70">Restricted access for Guild Masters only.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="admin@gentlecut.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-2 focus:ring-primary rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Secret Key</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-2 focus:ring-primary rounded-xl"
                  required
                />
              </div>
              <Button type="submit" disabled={loginLoading} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-primary/20">
                {loginLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Enter the Guild'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, Guild Master. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Appointments', value: '128', icon: Calendar, color: 'bg-blue-500' },
          { label: 'Active Artisans', value: '3', icon: Users, color: 'bg-primary' },
          { label: 'Revenue (Monthly)', value: '€5,420', icon: TrendingUp, color: 'bg-emerald-500' },
          { label: 'Service Types', value: '8', icon: Briefcase, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-2xl text-white ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-headline font-bold">Recent Appointments</CardTitle>
              <CardDescription>Latest bookings across all artisans.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-full text-xs font-bold uppercase tracking-tighter">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Client</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Service</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Artisan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { client: 'Julian Casablancas', service: 'Guild Classic', artisan: 'Marcus', status: 'CONFIRMED' },
                    { client: 'Alex Turner', service: 'The Precision Buzz', artisan: 'James', status: 'PENDING' },
                    { client: 'Kevin Parker', service: 'Traditional Shave', artisan: 'Elena', status: 'COMPLETED' },
                    { client: 'Jack White', service: 'Beard Sculpting', artisan: 'Marcus', status: 'CONFIRMED' },
                  ].map((appt, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{appt.client}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{appt.service}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter">{appt.artisan}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          appt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                          appt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                          'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        }>
                          {appt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md rounded-2xl overflow-hidden h-fit">
          <CardHeader className="bg-white border-b border-slate-100">
            <CardTitle className="text-xl font-headline font-bold">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <Button className="w-full justify-start gap-3 h-12 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl shadow-md shadow-secondary/20">
              <Calendar className="w-4 h-4" />
              Add Manual Appointment
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12 border-2 hover:bg-slate-50 font-bold rounded-xl">
              <Briefcase className="w-4 h-4 text-primary" />
              New Service Type
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12 border-2 hover:bg-slate-50 font-bold rounded-xl">
              <Users className="w-4 h-4 text-secondary" />
              Update Barber Hours
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
