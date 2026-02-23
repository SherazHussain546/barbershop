
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, serverTimestamp, query, orderBy, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Tag, Crown, Plus, Trash2, Loader2, Clock, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ServicesManagement() {
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
    setIsAddingDeal(true);
    const data = {
      title: dealTitle,
      description: dealDesc,
      discountValue: parseFloat(dealDiscount),
      discountType: 'PERCENTAGE',
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(firestore, 'deals'), data);
      toast({ title: "Success", description: "Promotional deal created." });
      setDealTitle(''); setDealDesc(''); setDealDiscount('');
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-bold text-slate-900">Services & Offerings</h1>
        <p className="text-slate-500 mt-1">Manage the Guild's grooming menu, deals, and memberships.</p>
      </div>

      <Tabs defaultValue="services" className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="services" className="rounded-lg">Services</TabsTrigger>
          <TabsTrigger value="deals" className="rounded-lg">Deals</TabsTrigger>
          <TabsTrigger value="subs" className="rounded-lg">Subs</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <Plus className="w-5 h-5" /> New Service
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddService} className="space-y-4">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="e.g., Master Fade" required />
                </div>
                <div className="space-y-2">
                  <Label>Price (€)</Label>
                  <Input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="45" required />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholder="45" required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={setServiceCategory} defaultValue="Haircuts">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Haircuts">Haircuts</SelectItem>
                      <SelectItem value="Grooming">Grooming</SelectItem>
                      <SelectItem value="Packages">Packages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} placeholder="Describe the experience..." required />
                </div>
                <Button type="submit" disabled={isAddingService} className="w-full">
                  {isAddingService ? <Loader2 className="animate-spin" /> : 'Add Service'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Grooming Menu</CardTitle></CardHeader>
            <CardContent>
              {servicesLoading ? <Loader2 className="animate-spin mx-auto" /> : (
                <div className="space-y-4">
                  {services?.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <h4 className="font-bold text-slate-900">{s.name}</h4>
                        <p className="text-xs text-slate-500">{s.category} • {s.durationMinutes}m • €{s.price}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('services', s.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="bg-secondary text-white"><CardTitle>New Deal</CardTitle></CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddDeal} className="space-y-4">
                <div className="space-y-2">
                  <Label>Deal Title</Label>
                  <Input value={dealTitle} onChange={(e) => setDealTitle(e.target.value)} placeholder="Father & Son" required />
                </div>
                <div className="space-y-2">
                  <Label>Discount (%)</Label>
                  <Input type="number" value={dealDiscount} onChange={(e) => setDealDiscount(e.target.value)} placeholder="15" required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={dealDesc} onChange={(e) => setDealDesc(e.target.value)} placeholder="Details..." required />
                </div>
                <Button type="submit" disabled={isAddingDeal} className="w-full bg-secondary">
                  {isAddingDeal ? <Loader2 className="animate-spin" /> : 'Create Deal'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Active Promotions</CardTitle></CardHeader>
            <CardContent>
              {dealsLoading ? <Loader2 className="animate-spin mx-auto" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deals?.map(d => (
                    <div key={d.id} className="p-6 bg-slate-900 text-white rounded-2xl relative overflow-hidden group">
                      <Tag className="absolute -right-2 -top-2 w-16 h-16 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
                      <h4 className="text-xl font-bold">{d.title}</h4>
                      <p className="text-primary font-black text-2xl">-{d.discountValue}%</p>
                      <p className="text-xs text-slate-400 mt-2">{d.description}</p>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('deals', d.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subs" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="bg-primary text-white"><CardTitle>New Membership</CardTitle></CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddSub} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tier Name</Label>
                  <Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="Gentleman's Club" required />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Price (€)</Label>
                  <Input type="number" value={subPrice} onChange={(e) => setSubPrice(e.target.value)} placeholder="99" required />
                </div>
                <div className="space-y-2">
                  <Label>Features (comma separated)</Label>
                  <Textarea value={subFeatures} onChange={(e) => setSubFeatures(e.target.value)} placeholder="Unlimited cuts, Free coffee..." required />
                </div>
                <Button type="submit" disabled={isAddingSub} className="w-full">
                  {isAddingSub ? <Loader2 className="animate-spin" /> : 'Add Tier'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Subscription Tiers</CardTitle></CardHeader>
            <CardContent>
              {subsLoading ? <Loader2 className="animate-spin mx-auto" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subs?.map(s => (
                    <div key={s.id} className="p-6 border-2 border-primary/20 rounded-2xl relative bg-white">
                      <Crown className="w-8 h-8 text-primary mb-4" />
                      <h4 className="text-xl font-bold">{s.name}</h4>
                      <p className="text-3xl font-black mt-2">€{s.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                      <ul className="mt-4 space-y-2">
                        {s.features.map((f, i) => <li key={i} className="text-xs text-slate-600 flex items-center gap-2">• {f}</li>)}
                      </ul>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('subscriptions', s.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
