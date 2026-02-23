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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, User, Scissors, CheckCircle2, Download, Mail, Loader2, Sparkles, ChevronRight, MapPin, ArrowLeft } from 'lucide-react';
import { format, addMinutes, startOfDay, endOfDay, isBefore, setHours, setMinutes, eachMinuteOfInterval, addDays } from 'date-fns';
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
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  // Hydration safety
  useEffect(() => {
    setDate(new Date());
  }, []);

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
    // Shop hours: 10:00 AM to 7:00 PM
    const start = setHours(setMinutes(date, 0), 10); 
    const end = setHours(setMinutes(date, 0), 19); 
    
    const interval = eachMinuteOfInterval({ start, end }, { step: 30 });
    
    return interval.filter(slot => {
      // hydration safe check
      const now = new Date();
      if (isBefore(slot, now)) return false;
      
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

  const dateOptions = useMemo(() => {
    const options = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < 30; i++) {
      options.push(addDays(today, i));
    }
    return options;
  }, []);

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
        <div className="max-w-6xl mx-auto px-4">
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

          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="bg-slate-900 text-white p-10 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <CardTitle className="text-3xl font-headline relative z-10">Select Your Services</CardTitle>
                  <CardDescription className="text-slate-400 relative z-10">Choose one or more master grooming services from our menu.</CardDescription>
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
                              <Clock className="w-3.5 h-3.5 text-secondary" /> {service.durationMinutes} mins
                            </p>
                          </div>
                        </div>
                        <p className="text-xl font-black text-primary">€{service.price}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-10 p-8 bg-slate-900 rounded-[2rem] border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Selected Services ({selectedServices.length})</p>
                      <p className="text-4xl font-black text-white">€{totalPrice}</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                       <Button 
                        disabled={selectedServices.length === 0}
                        onClick={() => setStep(2)}
                        className="flex-1 md:w-auto h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-sm shadow-xl shadow-primary/20 group"
                      >
                        Continue
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <CardHeader className="bg-slate-900 text-white p-10 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
                  <CardTitle className="text-3xl font-headline relative z-10">Details & Preferences</CardTitle>
                  <CardDescription className="text-slate-400 relative z-10">Personalize your visit to the Gentlecut Guild.</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">First Name</Label>
                          <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Arthur" className="h-14 border-2 rounded-xl focus:ring-primary" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Last Name</Label>
                          <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Morgan" className="h-14 border-2 rounded-xl focus:ring-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="arthur@example.com" className="h-14 border-2 rounded-xl focus:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</Label>
                        <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="h-14 border-2 rounded-xl focus:ring-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Preferred Artisan (Optional)</Label>
                      <div className="grid gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        <div 
                          onClick={() => setSelectedBarber('any')}
                          className={cn(
                            "flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all",
                            selectedBarber === 'any' ? "border-primary bg-primary/5 shadow-md" : "border-slate-100 bg-white hover:border-slate-200"
                          )}
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <User className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Any Master Barber</p>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">First Available</p>
                          </div>
                        </div>
                        {barbers?.map(barber => (
                          <div 
                            key={barber.id}
                            onClick={() => setSelectedBarber(barber.id)}
                            className={cn(
                              "flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all",
                              selectedBarber === barber.id ? "border-primary bg-primary/5 shadow-md" : "border-slate-100 bg-white hover:border-slate-200"
                            )}
                          >
                            <div className="relative w-12 h-12">
                              <img src={barber.profileImageUrl} className="w-full h-full rounded-xl object-cover shadow-sm" />
                              {selectedBarber === barber.id && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
                                  <CheckCircle2 className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{barber.name}</p>
                              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{barber.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="h-16 px-10 rounded-2xl border-2 font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Back</Button>
                    <Button 
                      disabled={!firstName || !lastName || !email || !phone}
                      onClick={() => setStep(3)}
                      className="flex-1 h-16 rounded-2xl bg-secondary hover:bg-secondary/90 font-bold uppercase tracking-widest shadow-xl shadow-secondary/20"
                    >
                      Pick a Time
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <CardHeader className="bg-slate-900 text-white p-10 relative overflow-hidden flex flex-row items-center justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <CardTitle className="text-3xl font-headline">Select Date & Time</CardTitle>
                    <CardDescription className="text-slate-400">Choose a slot that works for you.</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setStep(2)} className="relative z-10 text-white hover:bg-white/10 flex items-center gap-2 font-bold">
                    <ArrowLeft className="w-4 h-4" /> Change Details
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Left Column: Date Selection Dropdown */}
                    <div className="lg:col-span-7 p-10 border-r border-slate-100 bg-white flex flex-col justify-center">
                      <div className="mb-8">
                        <Label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-4">
                          <CalendarIcon className="w-4 h-4 text-primary" />
                          Step 1: Choose a Date
                        </Label>
                        <Select 
                          value={date ? startOfDay(date).toISOString() : undefined} 
                          onValueChange={(val) => {
                            const selected = new Date(val);
                            setDate(selected);
                            setSelectedTime(null);
                          }}
                        >
                          <SelectTrigger className="h-20 border-2 rounded-3xl text-xl font-bold bg-slate-50 shadow-inner group hover:border-primary transition-all">
                            <SelectValue placeholder="Pick a date for your grooming" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-2">
                            {dateOptions.map((d) => (
                              <SelectItem key={d.toISOString()} value={d.toISOString()} className="h-14 text-lg font-medium rounded-xl">
                                {format(d, 'EEEE, MMMM do')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Scissors className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Preparation</p>
                            <p className="text-sm font-bold text-slate-900">Arrive 5 minutes before your slot.</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                          Selecting a date will reveal the Guild's master schedule for that day. Our artisans value your punctuality as much as you value their precision.
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Time Slots */}
                    <div className="lg:col-span-5 p-10 bg-slate-50/50">
                      <div className="mb-8">
                        <Label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-primary" />
                          Step 2: Available Slots
                        </Label>
                        <p className="text-lg font-headline font-bold text-slate-900">
                          {date ? format(date, 'EEEE, MMMM do') : 'Select a date'}
                        </p>
                      </div>

                      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        {date && availableSlots.length > 0 ? (
                          availableSlots.map((slot, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedTime(slot.toISOString())}
                              className={cn(
                                "w-full h-14 rounded-xl font-bold transition-all flex items-center justify-center border-2",
                                selectedTime === slot.toISOString()
                                  ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                                  : "bg-white border-slate-100 text-slate-700 hover:border-primary/40 hover:bg-slate-50"
                              )}
                            >
                              {format(slot, 'HH:mm')}
                              {selectedTime === slot.toISOString() && <Sparkles className="w-4 h-4 ml-2 animate-pulse" />}
                            </button>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                              <CalendarIcon className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-medium px-10">
                              {date ? "No availability for this date." : "Please select a date from the dropdown."}
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedTime && (
                        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
                          <Button 
                            disabled={isSubmitting}
                            onClick={handleBooking}
                            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest shadow-2xl shadow-primary/30 text-lg"
                          >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Confirm Booking'}
                          </Button>
                          <p className="text-[10px] text-center mt-3 text-slate-400 font-bold uppercase tracking-[0.2em]">
                            Instant Confirmation via Email
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in zoom-in-95 duration-700 p-20 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />
                
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-4xl md:text-5xl font-headline font-black mb-4 uppercase tracking-tighter">You're <span className="text-primary italic">Enrolled</span>, {firstName}!</h2>
                <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto leading-relaxed">
                  Your seat in the Guild is secured for <span className="text-slate-900 font-bold underline decoration-primary/30 decoration-4 underline-offset-4">{format(bookedAppointment.startTime, 'PPPP')}</span> at <span className="text-slate-900 font-bold">{format(bookedAppointment.startTime, 'p')}</span>.
                </p>
                
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl max-w-md mx-auto space-y-6 mb-12 text-left relative group">
                  <div className="absolute top-6 right-8 text-slate-100 group-hover:text-primary/10 transition-colors">
                    <Sparkles className="w-16 h-16" />
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <Scissors className="w-6 h-6 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Grooming Services</p>
                      <p className="text-lg font-bold text-slate-900">{selectedServiceObjects.map(s => s.name).join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <User className="w-6 h-6 text-secondary mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Assigned Artisan</p>
                      <p className="text-lg font-bold text-slate-900">{selectedBarber === 'any' ? 'Guild Master (First Available)' : barbers?.find(b => b.id === selectedBarber)?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <MapPin className="w-6 h-6 text-emerald-500 mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Location</p>
                      <p className="text-sm font-bold text-slate-900 leading-tight">123 Gentleman's Row, Suite 101<br />New York, NY 10001</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <Button onClick={generateICS} className="h-16 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest gap-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
                    <Download className="w-5 h-5" /> Add to Calendar
                  </Button>
                  <Button variant="outline" className="h-16 border-2 border-slate-200 font-bold uppercase tracking-widest gap-3 rounded-2xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95" asChild>
                    <a href={`mailto:${email}?subject=My Gentlecut Guild Appointment&body=Hello ${firstName},%0D%0A%0D%0AThis is a confirmation for your grooming appointment at Gentlecut Guild.%0D%0A%0D%0ADate: ${format(bookedAppointment.startTime, 'PPPP')}%0D%0ATime: ${format(bookedAppointment.startTime, 'p')}%0D%0AServices: ${selectedServiceObjects.map(s => s.name).join(', ')}%0D%0A%0D%0AWe look forward to seeing you at 123 Gentleman's Row!%0D%0A%0D%0ABest regards,%0D%0AThe Guild`}>
                      <Mail className="w-5 h-5" /> Email Confirmation
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e2e2;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d4;
        }
      `}</style>
    </main>
  );
}
