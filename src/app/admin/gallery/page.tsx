'use client';

import { useState, useRef, use } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, serverTimestamp, query, orderBy, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Plus, Trash2, Loader2, ExternalLink, Upload, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function GalleryManagement(props: { params: Promise<any>, searchParams: Promise<any> }) {
  use(props.params);
  use(props.searchParams);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'galleryImages'), orderBy('uploadedAt', 'desc'));
  }, [firestore]);

  const { data: images, isLoading } = useCollection(galleryQuery);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please choose an image smaller than 800KB for best performance.",
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !caption) return;

    let finalImageUrl = imageUrl;
    if (filePreview) finalImageUrl = filePreview;

    if (!finalImageUrl) {
      toast({
        variant: "destructive",
        title: "Missing Image",
        description: "Please provide an image URL or upload a file.",
      });
      return;
    }

    const colRef = collection(firestore, 'galleryImages');
    const imageData = {
      imageUrl: finalImageUrl,
      caption,
      uploadedAt: serverTimestamp(),
      isFeatured: false,
      displayOrder: images ? images.length : 0,
    };

    // Non-blocking mutation with contextual error handling
    addDoc(colRef, imageData).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: imageData
      }));
    });
    
    // Reset form optimistically
    setImageUrl('');
    setCaption('');
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    toast({
      title: "Success",
      description: "Image addition initiated.",
    });
  };

  const handleDeleteImage = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'galleryImages', id);
    
    // Non-blocking mutation with contextual error handling
    deleteDoc(docRef).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });

    toast({
      title: "Processing",
      description: "Removing image from gallery...",
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-900">Gallery Management</h1>
          <p className="text-slate-500 mt-1">Curate the Guild's visual legacy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-md rounded-2xl overflow-hidden h-fit sticky top-8">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Masterpiece
            </CardTitle>
            <CardDescription className="text-white/70">Showcase your latest work.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAddImage} className="space-y-6">
              <Tabs defaultValue="url" className="w-full" onValueChange={() => {
                setImageUrl('');
                setFilePreview(null);
                setSelectedFile(null);
              }}>
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    From Link
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Upload className="w-4 h-4 mr-2" />
                    From Device
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Image URL</Label>
                    <Input 
                      placeholder="https://images.unsplash.com/..." 
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="h-11 border-2"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Upload Image</Label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-slate-50"
                    >
                      {filePreview ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border">
                          <Image src={filePreview} alt="Preview" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-sm font-bold text-slate-500">Click to browse</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Max 800KB (JPG/PNG)</p>
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
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Artisan's Caption</Label>
                <Input 
                  placeholder="e.g., Traditional Scissor Cut" 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="h-11 border-2"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isAdding} 
                className="w-full h-14 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
              >
                {isAdding ? <Loader2 className="animate-spin w-5 h-5" /> : 'Add to Collection'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100">
            <CardTitle className="text-xl font-headline font-bold">Public Lookbook</CardTitle>
            <CardDescription>Live view of the salon's visual portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : !images || images.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold italic font-headline">The gallery is currently empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="group relative rounded-xl overflow-hidden bg-slate-100 aspect-square border border-slate-100 shadow-sm">
                    <Image 
                      src={image.imageUrl} 
                      alt={image.caption} 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                      <p className="text-white font-bold text-lg font-headline mb-4">{image.caption}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteImage(image.id)}
                          className="flex-1 h-10 rounded-lg font-bold uppercase tracking-tighter"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Discard
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-10 w-10 p-0 rounded-lg"
                          asChild
                        >
                          <a href={image.imageUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
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
