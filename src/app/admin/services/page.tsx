'use client';

import { useState, use } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, serverTimestamp, query, orderBy, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Tag, Crown, Plus, Trash2, Loader2, Scissors, CheckCircle2, Percent, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';

export default function ServicesManagement(props: { params: Promise<any>, searchParams: Promise<any> }) {
  use(props.params);
  use(props.searchParams);
  const { toast } = useToast();
  const firestore = useFirestore();

  // Queries
  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const dealsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'deals'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const subsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'subscriptions'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: services, isLoading: servicesLoading } = useCollection(servicesQuery);
  const { data: deals, isLoading: dealsLoading } = useCollection(dealsQuery);
  const { data: subs, isLoading: subsLoading } = useCollection(subsQuery);

  // Form States - Services
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Haircuts');
  const [isAddingService, setIsAddingService] = useState(false);

  // Form States - Deals
  const [dealTitle, setDealTitle] = useState('');
  const [dealDesc, setDealDesc] = useState('');
  const [dealDiscount, setDealDiscount] = useState('');
  const [dealDiscountType, setDealDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [selectedDealServiceIds, setSelectedDealServiceIds] = useState<string[]>([]);
  const [isAddingDeal, setIsAddingDeal] = useState(false);

  // Form States - Subscriptions
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState('');
  const [subFeatures, setSubFeatures] = useState('');
  const [isAddingSub, setIsAddingSub] = useState(false);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    setIsAddingService(true);
    const data = {
      name: serviceName,
      description: serviceDesc,
      price: parseFloat(servicePrice),
      durationMinutes: parseInt(serviceDuration),
      category: serviceCategory,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(firestore, 'services'), data);
      toast({ title: "Success", description: "Service added to the menu." });
      setServiceName(''); setServiceDesc(''); setServicePrice(''); setServiceDuration('');
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'services', operation: 'create', requestResourceData: data }));
    } finally { setIsAddingService(false); }
  };

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    if (selectedDealServiceIds.length < 2) {
      toast({ variant: "destructive", title: "Selection Required", description: "Please select at least 2 services to create a bundle deal." });
      return;
    }

    setIsAddingDeal(true);
    const data = {
      title: dealTitle,
      description: dealDesc,
      discountValue: parseFloat(dealDiscount),
      discountType: dealDiscountType,
      serviceIds: selectedDealServiceIds,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(firestore, 'deals'), data);
      toast({ title: "Success", description: "Promotional bundle created." });
      setDealTitle(''); setDealDesc(''); setDealDiscount(''); setSelectedDealServiceIds([]);
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'deals', operation: 'create', requestResourceData: data }));
    } finally { setIsAddingDeal(false); }
  };

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    setIsAddingSub(true);
    const data = {
      name: subName,
      price: parseFloat(subPrice),
      billingCycle: 'MONTHLY',
      features: subFeatures.split(',').map(f => f.trim()),
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(firestore, 'subscriptions'), data);
      toast({ title: "Success", description: "Membership tier added." });
      setSubName(''); setSubPrice(''); setSubFeatures('');
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'subscriptions', operation: 'create', requestResourceData: data }));
    } finally { setIsAddingSub(false); }
  };

  const handleDelete = async (col: string, id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, col, id));
      toast({ title: "Success", description: "Item removed." });
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `${col}/${id}`, operation: 'delete' }));
    }
  };

  const toggleDealService = (id: string) => {
    setSelectedDealServiceIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-bold text-slate-900">Services & Offerings</h1>
        <p className="text-slate-500 mt-1">Manage the Guild's grooming menu, bundle deals, and memberships.</p>
      </div>

      <Tabs defaultValue="services" className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="services" className="rounded-lg">Services</TabsTrigger>
          <TabsTrigger value="deals" className="rounded-lg">Bundle Deals</TabsTrigger>
          <TabsTrigger value="subs" className="rounded-lg">Memberships</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit border-none shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <Plus className="w-5 h-5" /> New Service
              </CardTitle>
              <CardDescription className="text-white/70">Define a single grooming session.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddService} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Service Name</Label>
                  <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="e.g., Master Fade" className="h-11 border-2" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Price (€)</Label>
                    <Input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="45" className="h-11 border-2" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Duration (min)</Label>
                    <Input type="number" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholder="45" className="h-11 border-2" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</Label>
                  <Select onValueChange={setServiceCategory} defaultValue="Haircuts">
                    <SelectTrigger className="h-11 border-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Haircuts">Haircuts</SelectItem>
                      <SelectItem value="Grooming">Grooming</SelectItem>
                      <SelectItem value="Packages">Packages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</Label>
                  <Textarea value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} placeholder="Describe the master experience..." className="border-2 min-h-[100px]" required />
                </div>
                <Button type="submit" disabled={isAddingService} className="w-full h-12 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-xs">
                  {isAddingService ? <Loader2 className="animate-spin" /> : 'Add Service to Menu'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100"><CardTitle className="text-xl font-headline font-bold">Grooming Menu</CardTitle></CardHeader>
            <CardContent className="p-0">
              {servicesLoading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : (
                <div className="divide-y divide-slate-100">
                  {services?.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Scissors className="w-5 h-5" /></div>
                        <div>
                          <h4 className="font-bold text-slate-900">{s.name}</h4>
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">{s.category} • {s.durationMinutes}m • €{s.price}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('services', s.id)} className="text-slate-300 hover:text-red-500 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {(!services || services.length === 0) && <div className="p-20 text-center text-slate-400 italic">No services listed yet.</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit border-none shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary text-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <Tag className="w-5 h-5" /> New Bundle Deal
              </CardTitle>
              <CardDescription className="text-white/70">Create a promotional package for multiple services.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddDeal} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Deal Title</Label>
                  <Input value={dealTitle} onChange={(e) => setDealTitle(e.target.value)} placeholder="e.g., Father & Son Special" className="h-11 border-2" required />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Select Services (Min 2)</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar p-1">
                    {services?.map(service => (
                      <div 
                        key={service.id}
                        onClick={() => toggleDealService(service.id)}
                        className={cn(
                          "p-3 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all",
                          selectedDealServiceIds.includes(service.id) ? "border-secondary bg-secondary/5" : "border-slate-50 hover:border-slate-100"
                        )}
                      >
                        <span className="text-sm font-bold text-slate-700">{service.name}</span>
                        {selectedDealServiceIds.includes(service.id) && <CheckCircle2 className="w-4 h-4 text-secondary" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Discount Configuration</Label>
                  <div className="flex bg-slate-100 p-1 rounded-xl mb-3">
                    <Button 
                      type="button"
                      variant={dealDiscountType === 'PERCENTAGE' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setDealDiscountType('PERCENTAGE')}
                      className="flex-1 rounded-lg gap-2 text-[10px] font-bold uppercase"
                    >
                      <Percent className="w-3 h-3" /> Percentage
                    </Button>
                    <Button 
                      type="button"
                      variant={dealDiscountType === 'FIXED' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setDealDiscountType('FIXED')}
                      className="flex-1 rounded-lg gap-2 text-[10px] font-bold uppercase"
                    >
                      <Euro className="w-3 h-3" /> Fixed Price
                    </Button>
                  </div>
                  <Input 
                    type="number" 
                    value={dealDiscount} 
                    onChange={(e) => setDealDiscount(e.target.value)} 
                    placeholder={dealDiscountType === 'PERCENTAGE' ? "e.g., 15" : "e.g., 20"} 
                    className="h-11 border-2"
                    required 
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    {dealDiscountType === 'PERCENTAGE' ? "Percentage off total services." : "Fixed Euro amount to subtract from total."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</Label>
                  <Textarea value={dealDesc} onChange={(e) => setDealDesc(e.target.value)} placeholder="Terms and details..." className="border-2 min-h-[80px]" required />
                </div>
                
                <Button type="submit" disabled={isAddingDeal} className="w-full h-12 bg-secondary hover:bg-secondary/90 font-bold uppercase tracking-widest text-xs">
                  {isAddingDeal ? <Loader2 className="animate-spin" /> : 'Activate Bundle Deal'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100"><CardTitle className="text-xl font-headline font-bold">Active Promotions</CardTitle></CardHeader>
            <CardContent className="p-6">
              {dealsLoading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-secondary" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {deals?.map(d => (
                    <div key={d.id} className="p-6 bg-slate-900 text-white rounded-[2rem] relative overflow-hidden group border border-white/5 shadow-xl">
                      <Tag className="absolute -right-2 -top-2 w-20 h-20 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
                      <div className="relative z-10">
                        <h4 className="text-xl font-bold font-headline mb-1">{d.title}</h4>
                        <div className="flex items-center gap-2 mb-4">
                          <p className="text-primary font-black text-3xl">
                            {d.discountType === 'PERCENTAGE' ? `-${d.discountValue}%` : `-€${d.discountValue}`}
                          </p>
                          <Badge variant="outline" className="border-white/20 text-white/50 uppercase tracking-tighter text-[9px] h-5">BUNDLE</Badge>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 italic mb-4">"{d.description}"</p>
                        
                        <div className="space-y-1.5 border-t border-white/10 pt-4">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Includes Services:</p>
                          {d.serviceIds?.map((sId: string) => {
                            const s = services?.find(serv => serv.id === sId);
                            return s ? (
                              <div key={sId} className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                                <CheckCircle2 className="w-3 h-3 text-primary" /> {s.name}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('deals', d.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 hover:bg-white/5 rounded-full transition-all">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {(!deals || deals.length === 0) && <div className="col-span-2 p-20 text-center text-slate-400 italic">No active bundle deals.</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subs" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit border-none shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <Crown className="w-5 h-5" /> New Membership
              </CardTitle>
              <CardDescription className="text-white/70">Create recurring revenue with elite tiers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddSub} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tier Name</Label>
                  <Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="e.g., Gentleman's Executive Club" className="h-11 border-2" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Monthly Price (€)</Label>
                  <Input type="number" value={subPrice} onChange={(e) => setSubPrice(e.target.value)} placeholder="99" className="h-11 border-2" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Features (comma separated)</Label>
                  <Textarea value={subFeatures} onChange={(e) => setSubFeatures(e.target.value)} placeholder="Unlimited cuts, Free premium beverages, Priority booking..." className="border-2 min-h-[120px]" required />
                </div>
                <Button type="submit" disabled={isAddingSub} className="w-full h-12 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-xs">
                  {isAddingSub ? <Loader2 className="animate-spin" /> : 'Launch Membership Tier'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2 border-none shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100"><CardTitle className="text-xl font-headline font-bold">Membership Roster</CardTitle></CardHeader>
            <CardContent className="p-6">
              {subsLoading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subs?.map(s => (
                    <div key={s.id} className="p-8 border-2 border-slate-100 rounded-[2.5rem] relative bg-white hover:border-primary/50 transition-all group shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                        <Crown className="w-6 h-6" />
                      </div>
                      <h4 className="text-2xl font-headline font-bold text-slate-900">{s.name}</h4>
                      <div className="flex items-baseline gap-1 mt-2 mb-6">
                        <p className="text-4xl font-black text-slate-900">€{s.price}</p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">/ month</p>
                      </div>
                      <ul className="space-y-3 mb-4">
                        {s.features.map((f, i) => (
                          <li key={i} className="text-xs font-bold text-slate-600 flex items-center gap-3">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('subscriptions', s.id)} className="absolute top-6 right-6 text-slate-200 hover:text-red-500 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {(!subs || subs.length === 0) && <div className="col-span-2 p-20 text-center text-slate-400 italic">No membership tiers defined.</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
