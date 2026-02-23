
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc, Timestamp, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, User, Clock, CheckCircle2, XCircle, Trash2, Loader2, Phone, Mail, Scissors, LayoutList, CalendarDays } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function AppointmentsAdmin() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'appointments'), orderBy('startTime', 'asc'));
  }, [firestore]);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'));
  }, [firestore]);

  const barbersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'barbers'));
  }, [firestore]);

  const { data: allAppointments, isLoading } = useCollection(appointmentsQuery);
  const { data: services } = useCollection(servicesQuery);
  const { data: barbers } = useCollection(barbersQuery);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'appointments', id);
    try {
      await updateDoc(docRef, { status });
      toast({ title: "Updated", description: `Appointment marked as ${status.toLowerCase()}.` });
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `appointments/${id}`, operation: 'update' }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'appointments', id);
    try {
      await deleteDoc(docRef);
      toast({ title: "Removed", description: "Appointment record deleted." });
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `appointments/${id}`, operation: 'delete' }));
    }
  };

  const filteredAppointments = viewMode === 'calendar' && selectedDate
    ? allAppointments?.filter(app => {
        const appDate = (app.startTime as any)?.toDate();
        return format(appDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      })
    : allAppointments;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-900 uppercase tracking-tight">Upcoming Appointments</h1>
          <p className="text-slate-500 mt-1">Manage the Guild's daily schedule and client visits.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('list')}
            className="rounded-lg gap-2"
          >
            <LayoutList className="w-4 h-4" />
            List
          </Button>
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('calendar')}
            className="rounded-lg gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            Calendar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : (
        <div className={cn("grid gap-8", viewMode === 'calendar' ? "lg:grid-cols-12" : "grid-cols-1")}>
          
          {viewMode === 'calendar' && (
            <Card className="lg:col-span-5 border-none shadow-xl rounded-3xl overflow-hidden h-fit sticky top-8">
              <CardHeader className="bg-slate-900 text-white p-8">
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-0"
                />
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Viewing Schedule for</p>
                    <p className="text-lg font-bold text-slate-900">{selectedDate ? format(selectedDate, 'PPPP') : 'Today'}</p>
                  </div>
                  <Badge className="bg-primary text-white font-bold">{filteredAppointments?.length || 0} Bookings</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className={cn("space-y-6", viewMode === 'calendar' ? "lg:col-span-7" : "w-full")}>
            {!filteredAppointments || filteredAppointments.length === 0 ? (
              <Card className="text-center py-20 border-2 border-dashed rounded-[2.5rem] bg-white">
                <CalendarIcon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-headline italic text-xl">No appointments found for this selection.</p>
              </Card>
            ) : (
              filteredAppointments.map((app) => {
                const appServices = services?.filter(s => app.serviceIds?.includes(s.id)) || [];
                const barber = barbers?.find(b => b.id === app.barberId);
                const startTime = (app.startTime as any)?.toDate();

                return (
                  <Card key={app.id} className="border-none shadow-md overflow-hidden rounded-3xl hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-slate-900 text-white p-8 md:w-48 flex flex-col justify-center items-center text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">{startTime ? format(startTime, 'EEE') : 'Unknown'}</p>
                        <p className="text-4xl font-black">{startTime ? format(startTime, 'dd') : '--'}</p>
                        <p className="text-xs font-bold uppercase text-primary mt-1">{startTime ? format(startTime, 'MMM') : '--'}</p>
                        <div className="mt-4 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-bold">{startTime ? format(startTime, 'p') : '--:--'}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-8 bg-white flex flex-col md:flex-row justify-between gap-8">
                        <div className="space-y-6">
                          <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-2xl font-headline font-bold text-slate-900">{app.firstName} {app.lastName}</h3>
                              <Badge className={cn("rounded-full px-3 py-1 font-bold text-[10px]", getStatusColor(app.status))}>
                                {app.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"><Mail className="w-3.5 h-3.5" /> {app.email}</span>
                              <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"><Phone className="w-3.5 h-3.5" /> {app.phone}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {appServices.map(s => (
                              <Badge key={s.id} variant="secondary" className="bg-slate-50 text-slate-700 border border-slate-100 flex items-center gap-2 py-2 px-4 rounded-xl">
                                <Scissors className="w-3.5 h-3.5 text-primary" /> {s.name}
                              </Badge>
                            ))}
                          </div>

                          {barber && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl w-fit">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <p className="text-sm font-bold text-slate-700">Artisan: <span className="text-slate-900">{barber.name}</span></p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row md:flex-col justify-between items-end gap-6">
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Investment</p>
                            <p className="text-3xl font-black text-slate-900">€{app.totalPrice}</p>
                          </div>
                          <div className="flex gap-2">
                            {app.status !== 'CONFIRMED' && app.status !== 'COMPLETED' && (
                              <Button size="sm" onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')} className="bg-emerald-500 hover:bg-emerald-600 rounded-xl h-10 px-6 font-bold uppercase tracking-widest text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Confirm
                              </Button>
                            )}
                            {app.status === 'CONFIRMED' && (
                              <Button size="sm" onClick={() => handleUpdateStatus(app.id, 'COMPLETED')} className="bg-blue-500 hover:bg-blue-600 rounded-xl h-10 px-6 font-bold uppercase tracking-widest text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Complete
                              </Button>
                            )}
                            {app.status !== 'CANCELLED' && (
                              <Button size="icon" variant="outline" onClick={() => handleUpdateStatus(app.id, 'CANCELLED')} className="text-red-500 hover:bg-red-50 rounded-xl h-10 w-10 border-2">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(app.id)} className="text-slate-300 hover:text-red-500 rounded-xl h-10 w-10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
