
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, where, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, Clock, User, Scissors, CheckCircle2, Download, Mail, Loader2 } from 'lucide-react';
import { format, addMinutes, startOfDay, endOfDay, isBefore, setHours, setMinutes, eachMinuteOfInterval } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useSearchParams } from 'next/navigation';

export default function BookingPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const searchParams = useSearchParams();

  // Firestore Data
  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'), orderBy('name', 'asc'));
  }, [firestore]);

  const barbersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'barbers'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: services } = useCollection(servicesQuery);
  const { data: barbers } = useCollection(barbersQuery);

  // Form State
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('any');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  // Deep Link Synchronization
  useEffect(() => {
    const initialServiceId = searchParams.get('serviceId');
    if (initialServiceId && !selectedServices.includes(initialServiceId)) {
      setSelectedServices(prev => [...prev, initialServiceId]);
    }
  }, [searchParams]);

  // Derived Values
  const selectedServiceObjects = services?.filter(s => selectedServices.includes(s.id)) || [];
  const totalDuration = selectedServiceObjects.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalPrice = selectedServiceObjects.reduce((acc, s) => acc + (s.price || 0), 0);
  
  // Available Slots Logic
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !date) return null;
    const start = startOfDay(date);
    const end = endOfDay(date);
    return query(
      collection(firestore, 'appointments'),
      where('startTime', '>=', Timestamp.fromDate(start)),
      where('startTime', '<=', Timestamp.fromDate(end))
    );
  }, [firestore, date]);

  const { data: dayAppointments } = useCollection(appointmentsQuery);

  const availableSlots = useMemo(() => {
    if (!date) return [];
    const slots = [];
    const start = setHours(setMinutes(date, 0), 9); // 9 AM
    const end = setHours(setMinutes(date, 0), 18); // 6 PM
    
    const interval = eachMinuteOfInterval({ start, end }, { step: 30 });
    
    return interval.filter(slot => {
      if (isBefore(slot, new Date())) return false;
      
      const slotEnd = addMinutes(slot, totalDuration || 30);
      
      // Basic overlap check
      const isOccupied = dayAppointments?.some(app => {
        const appStart = (app.startTime as any).toDate();
        const appEnd = (app.endTime as any).toDate();
        return (slot < appEnd && slotEnd > appStart);
      });

      return !isOccupied;
    });
  }, [date, dayAppointments, totalDuration]);

  const handleToggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleBooking = async () => {
    if (!firestore || !date || !selectedTime) return;
    
    setIsSubmitting(true);
    const startTime = new Date(selectedTime);
    const endTime = addMinutes(startTime, totalDuration);

    const appointmentData = {
      firstName,
      lastName,
      email,
      phone,
      serviceIds: selectedServices,
      barberId: selectedBarber === 'any' ? null : selectedBarber,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      totalPrice,
      status: 'PENDING',
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(firestore, 'appointments'), appointmentData);
      setBookedAppointment({ ...appointmentData, id: docRef.id, startTime, endTime });
      setStep(4);
      toast({ title: "Success", description: "Your appointment has been booked!" });
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'appointments',
        operation: 'create',
        requestResourceData: appointmentData
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateICS = () => {
    if (!bookedAppointment) return;
    const start = format(bookedAppointment.startTime, "yyyyMMdd'T'HHmmss");
    const end = format(bookedAppointment.endTime, "yyyyMMdd'T'HHmmss");
    const serviceNames = selectedServiceObjects.map(s => s.name).join(', ');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:Gentlecut Guild Appointment - ${serviceNames}`,
      `DESCRIPTION:Your appointment for ${serviceNames} at Gentlecut Guild.`,
      'LOCATION:123 Gentleman\'s Row, Suite 101, New York, NY 10001',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'gentlecut-appointment.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <section className="py-20 flex-grow">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="bg-primary mb-4 uppercase tracking-[0.2em] px-6 py-1.5 rounded-full">Secure Your Chair</Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-black text-slate-900 uppercase">Book an <span className="text-primary italic">Experience</span></h1>
            
            {/* Steps Progress */}
            <div className="flex items-center justify-center gap-4 mt-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                    step >= i ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-300 border-2"
                  )}>
                    {i}
                  </div>
                  {i < 3 && <div className={cn("w-12 h-1 rounded-full", step > i ? "bg-primary" : "bg-slate-200")} />}
                </div>
              ))}
            </div>
          </div>

          <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="bg-slate-900 text-white p-10 text-center">
                  <CardTitle className="text-2xl font-headline">Select Your Services</CardTitle>
                  <CardDescription className="text-slate-400">Choose one or more master grooming services.</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="grid gap-4">
                    {services?.map(service => (
                      <div 
                        key={service.id} 
                        onClick={() => handleToggleService(service.id)}
                        className={cn(
                          "flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer group",
                          selectedServices.includes(service.id) 
                            ? "border-primary bg-primary/5 shadow-md" 
                            : "border-slate-100 hover:border-slate-200 bg-white"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors",
                            selectedServices.includes(service.id) ? "bg-primary border-primary text-white" : "border-slate-200"
                          )}>
                            {selectedServices.includes(service.id) && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-slate-900">{service.name}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" /> {service.durationMinutes} mins
                            </p>
                          </div>
                        </div>
                        <p className="text-xl font-black text-primary">€{service.price}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Investment</p>
                      <p className="text-3xl font-black text-slate-900">€{totalPrice}</p>
                    </div>
                    <Button 
                      disabled={selectedServices.length === 0}
                      onClick={() => setStep(2)}
                      className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-sm"
                    >
                      Next Step
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <CardHeader className="bg-slate-900 text-white p-10 text-center">
                  <CardTitle className="text-2xl font-headline">Details & Preferences</CardTitle>
                  <CardDescription className="text-slate-400">Let us know who's coming in and who you'd like to see.</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">First Name</Label>
                        <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Arthur" className="h-12 border-2 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Last Name</Label>
                        <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Morgan" className="h-12 border-2 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="arthur@example.com" className="h-12 border-2 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</Label>
                        <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="h-12 border-2 rounded-xl" />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Preferred Artisan (Optional)</Label>
                      <div className="grid gap-3">
                        <div 
                          onClick={() => setSelectedBarber('any')}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            selectedBarber === 'any' ? "border-primary bg-primary/5" : "border-slate-100 bg-white"
                          )}
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User className="w-6 h-6" />
                          </div>
                          <p className="font-bold">Any Master Barber</p>
                        </div>
                        {barbers?.map(barber => (
                          <div 
                            key={barber.id}
                            onClick={() => setSelectedBarber(barber.id)}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              selectedBarber === barber.id ? "border-primary bg-primary/5" : "border-slate-100 bg-white"
                            )}
                          >
                            <img src={barber.profileImageUrl} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="font-bold">{barber.name}</p>
                              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{barber.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="h-14 px-8 rounded-xl border-2 font-bold uppercase tracking-widest">Back</Button>
                    <Button 
                      disabled={!firstName || !lastName || !email || !phone}
                      onClick={() => setStep(3)}
                      className="flex-1 h-14 rounded-xl bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest"
                    >
                      Choose Time Slot
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <CardHeader className="bg-slate-900 text-white p-10 text-center">
                  <CardTitle className="text-2xl font-headline">Finalize Appointment</CardTitle>
                  <CardDescription className="text-slate-400">Select an available slot on our artisan calendar.</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Select Date</Label>
                      <div className="p-4 bg-white border-2 rounded-2xl">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md"
                          disabled={(date) => isBefore(date, startOfDay(new Date()))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Available Times</Label>
                      <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
                        {availableSlots.length > 0 ? (
                          availableSlots.map((slot, i) => (
                            <Button
                              key={i}
                              variant={selectedTime === slot.toISOString() ? 'default' : 'outline'}
                              onClick={() => setSelectedTime(slot.toISOString())}
                              className={cn(
                                "h-12 rounded-lg font-bold transition-all",
                                selectedTime === slot.toISOString() ? "bg-primary shadow-lg shadow-primary/20" : ""
                              )}
                            >
                              {format(slot, 'HH:mm')}
                            </Button>
                          ))
                        ) : (
                          <div className="col-span-3 py-10 text-center text-slate-400 italic">
                            No slots available for this date.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="h-14 px-8 rounded-xl border-2 font-bold uppercase tracking-widest">Back</Button>
                    <Button 
                      disabled={!selectedTime || isSubmitting}
                      onClick={handleBooking}
                      className="flex-1 h-14 rounded-xl bg-secondary hover:bg-secondary/90 font-bold uppercase tracking-widest shadow-xl shadow-secondary/20"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Reservation'}
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in zoom-in-95 duration-700 p-20 text-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-headline font-black mb-4">You're Enrolled, {firstName}!</h2>
                <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">
                  Your mastery appointment is confirmed for <span className="text-slate-900 font-bold">{format(bookedAppointment.startTime, 'PPPP')}</span> at <span className="text-slate-900 font-bold">{format(bookedAppointment.startTime, 'p')}</span>.
                </p>
                
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 max-w-sm mx-auto space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Scissors className="w-4 h-4 text-primary" />
                    <p className="text-sm font-bold">{selectedServiceObjects.map(s => s.name).join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <User className="w-4 h-4 text-primary" />
                    <p className="text-sm font-bold">{selectedBarber === 'any' ? 'Any Master' : barbers?.find(b => b.id === selectedBarber)?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={generateICS} className="h-14 bg-secondary hover:bg-secondary/90 text-white font-bold uppercase tracking-widest gap-2 rounded-xl">
                    <Download className="w-5 h-5" /> Add to Calendar
                  </Button>
                  <Button variant="outline" className="h-14 border-2 font-bold uppercase tracking-widest gap-2 rounded-xl" asChild>
                    <a href={`mailto:${email}?subject=My Gentlecut Appointment&body=I have booked an appointment for ${selectedServiceObjects.map(s => s.name).join(', ')} on ${format(bookedAppointment.startTime, 'PPPP')} at ${format(bookedAppointment.startTime, 'p')}.`}>
                      <Mail className="w-5 h-5" /> Notify Me via Email
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
