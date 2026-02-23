'use client';

import { useState, useRef } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, serverTimestamp, query, orderBy, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Trash2, Loader2, Instagram, Upload, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function BarberManagement() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const barbersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'barbers'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: barbers, isLoading } = useCollection(barbersQuery);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please choose an image smaller than 800KB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !name || !role) return;

    let finalImageUrl = imageUrl;
    if (filePreview) finalImageUrl = filePreview;

    if (!finalImageUrl) {
      toast({
        variant: "destructive",
        title: "Missing Image",
        description: "Please provide a profile picture.",
      });
      return;
    }

    setIsAdding(true);
    const colRef = collection(firestore, 'barbers');
    const barberData = {
      name,
      role,
      instagramUrl: instagramUrl || '#',
      profileImageUrl: finalImageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDoc(colRef, barberData)
      .then(() => {
        toast({ title: "Success", description: `${name} has been added to the Guild.` });
        setName('');
        setRole('');
        setInstagramUrl('');
        setImageUrl('');
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: barberData
        }));
      })
      .finally(() => setIsAdding(false));
  };

  const handleDeleteBarber = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'barbers', id);
    
    deleteDoc(docRef).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });

    toast({ title: "Processing", description: "Removing artisan from roster..." });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-bold text-slate-900">Artisan Roster</h1>
        <p className="text-slate-500 mt-1">Manage the Guild's master barbers and stylists.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-md rounded-2xl overflow-hidden h-fit sticky top-8">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Artisan
            </CardTitle>
            <CardDescription className="text-white/70">Welcome a new master to the team.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAddBarber} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</Label>
                <Input 
                  placeholder="e.g., Marcus Aurelius" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 border-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Professional Title</Label>
                <Input 
                  placeholder="e.g., Master Barber" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-11 border-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Instagram Handle (Optional)</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="https://instagram.com/handle" 
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="h-11 border-2 pl-10"
                  />
                </div>
              </div>

              <Tabs defaultValue="upload" className="w-full pt-2">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger value="upload" className="rounded-lg">Upload</TabsTrigger>
                  <TabsTrigger value="link" className="rounded-lg">Link</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors bg-slate-50"
                  >
                    {filePreview ? (
                      <div className="relative aspect-[4/5] rounded-lg overflow-hidden border">
                        <Image src={filePreview} alt="Preview" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-4">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm font-bold text-slate-500">Click to upload photo</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="link" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Image URL</Label>
                    <Input 
                      placeholder="https://..." 
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="h-11 border-2"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                type="submit" 
                disabled={isAdding} 
                className="w-full h-14 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20 mt-4"
              >
                {isAdding ? <Loader2 className="animate-spin w-5 h-5" /> : 'Enlist Artisan'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100">
            <CardTitle className="text-xl font-headline font-bold">Current Team</CardTitle>
            <CardDescription>View and manage active Guild members.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : !barbers || barbers.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold italic font-headline">No artisans on the roster yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {barbers.map((barber) => (
                  <div key={barber.id} className="group relative rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm flex flex-col">
                    <div className="relative aspect-[4/5]">
                      <Image 
                        src={barber.profileImageUrl} 
                        alt={barber.name} 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center p-6 gap-4">
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDeleteBarber(barber.id)}
                          className="w-full font-bold uppercase tracking-widest"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <h4 className="font-bold text-lg font-headline text-slate-900">{barber.name}</h4>
                      <p className="text-primary text-xs font-bold uppercase tracking-widest">{barber.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
