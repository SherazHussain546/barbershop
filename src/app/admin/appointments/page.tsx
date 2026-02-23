
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, CheckCircle2, XCircle, Trash2, Loader2, Phone, Mail, Scissors } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AppointmentsAdmin() {
  const { toast } = useToast();
  const firestore = useFirestore();

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

  const { data: appointments, isLoading } = useCollection(appointmentsQuery);
  const { data: services } = useCollection(servicesQuery);
  const { data: barbers } = useCollection(barbersQuery);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-bold text-slate-900">Upcoming Appointments</h1>
        <p className="text-slate-500 mt-1">Manage client bookings and schedules.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : !appointments || appointments.length === 0 ? (
        <Card className="text-center py-20 border-2 border-dashed">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-headline italic text-lg">No appointments on the schedule.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {appointments.map((app) => {
            const appServices = services?.filter(s => app.serviceIds?.includes(s.id)) || [];
            const barber = barbers?.find(b => b.id === app.barberId);
            const startTime = (app.startTime as any)?.toDate();

            return (
              <Card key={app.id} className="border-none shadow-md overflow-hidden group hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-slate-900 text-white p-6 md:w-64 flex flex-col justify-center items-center text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{startTime ? format(startTime, 'EEEE') : 'Unknown'}</p>
                    <p className="text-3xl font-black">{startTime ? format(startTime, 'dd') : '--'}</p>
                    <p className="text-sm font-bold uppercase text-primary mt-1">{startTime ? format(startTime, 'MMMM') : '--'}</p>
                    <div className="mt-4 flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3 text-primary" />
                      <span className="text-xs font-bold">{startTime ? format(startTime, 'p') : '--:--'}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 bg-white flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-slate-900">{app.firstName} {app.lastName}</h3>
                          <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                        </div>
                        <div className="flex gap-4 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.phone}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {appServices.map(s => (
                          <Badge key={s.id} variant="secondary" className="flex items-center gap-1 py-1">
                            <Scissors className="w-3 h-3" /> {s.name}
                          </Badge>
                        ))}
                      </div>

                      {barber && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                          <User className="w-4 h-4 text-primary" />
                          Artisan: {barber.name}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col justify-between items-end gap-2">
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Investment</p>
                        <p className="text-2xl font-black text-slate-900">€{app.totalPrice}</p>
                      </div>
                      <div className="flex gap-2">
                        {app.status !== 'CONFIRMED' && (
                          <Button size="sm" onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')} className="bg-emerald-500 hover:bg-emerald-600 h-9">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm
                          </Button>
                        )}
                        {app.status !== 'CANCELLED' && (
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(app.id, 'CANCELLED')} className="text-red-500 hover:bg-red-50 h-9">
                            <XCircle className="w-4 h-4 mr-1" /> Cancel
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(app.id)} className="text-slate-300 hover:text-red-500 h-9 w-9">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
