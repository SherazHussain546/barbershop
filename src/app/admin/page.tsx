'use client';

import { useState, use, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Calendar, TrendingUp, Scissors, Loader2, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { format, startOfYear, isAfter } from 'date-fns';

export default function AdminDashboard(props: { params: Promise<any>, searchParams: Promise<any> }) {
  use(props.params);
  use(props.searchParams);
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const firestore = useFirestore();
  const auth = getAuth();

  // Queries for real-time stats
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'appointments'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const barbersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'barbers'));
  }, [firestore]);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'));
  }, [firestore]);

  const { data: appointments, isLoading: appointmentsLoading } = useCollection(appointmentsQuery);
  const { data: barbers, isLoading: barbersLoading } = useCollection(barbersQuery);
  const { data: services, isLoading: servicesLoading } = useCollection(servicesQuery);

  // Calculate Real-time Stats
  const stats = useMemo(() => {
    const totalAppts = appointments?.length || 0;
    const totalBarbers = barbers?.length || 0;
    const totalServs = services?.length || 0;
    
    // Revenue Year to Date
    const yearStart = startOfYear(new Date());
    const revenueYTD = appointments?.reduce((sum, appt) => {
      const apptDate = (appt.startTime as any)?.toDate();
      if (apptDate && isAfter(apptDate, yearStart) && appt.status !== 'CANCELLED') {
        return sum + (Number(appt.totalPrice) || 0);
      }
      return sum;
    }, 0) || 0;

    return {
      totalAppointments: totalAppts.toString(),
      activeArtisans: totalBarbers.toString(),
      revenueYTD: `€${revenueYTD.toLocaleString()}`,
      serviceTypes: totalServs.toString()
    };
  }, [appointments, barbers, services]);

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

  const isLoadingStats = appointmentsLoading || barbersLoading || servicesLoading;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, Guild Master. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Appointments', value: stats.totalAppointments },
          { label: 'Active Artisans', value: stats.activeArtisans },
          { label: 'Revenue (YTD)', value: stats.revenueYTD },
          { label: 'Service Types', value: stats.serviceTypes },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">
                {isLoadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-200" /> : stat.value}
              </h3>
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
            <Button variant="outline" size="sm" className="rounded-full text-xs font-bold uppercase tracking-tighter" asChild>
              <a href="/admin/appointments">View All</a>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {appointmentsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Client</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Service</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments?.slice(0, 5).map((appt) => {
                      const apptDate = (appt.startTime as any)?.toDate();
                      return (
                        <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{appt.firstName} {appt.lastName}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {services?.filter(s => appt.serviceIds?.includes(s.id)).map(s => (
                                <Badge key={s.id} variant="outline" className="text-[10px] py-0">{s.name}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            {apptDate ? format(apptDate, 'MMM dd, HH:mm') : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              appt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                              appt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                              appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                              'bg-amber-100 text-amber-700 hover:bg-amber-100'
                            }>
                              {appt.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md rounded-2xl overflow-hidden h-fit">
          <CardHeader className="bg-white border-b border-slate-100">
            <CardTitle className="text-xl font-headline font-bold">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Button className="w-full justify-start gap-3 h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
              <a href="/admin/appointments">
                <Calendar className="w-5 h-5" />
                Add Manual Appointment
              </a>
            </Button>
            <Button className="w-full justify-start gap-3 h-14 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-2xl shadow-lg shadow-secondary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
              <a href="/admin/services">
                <Briefcase className="w-5 h-5" />
                New Service Type
              </a>
            </Button>
            <Button className="w-full justify-start gap-3 h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
              <a href="/admin/barbers">
                <Users className="w-5 h-5" />
                Manage Master Barbers
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
