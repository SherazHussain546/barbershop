'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Plus, Trash2, Loader2, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function GalleryManagement() {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const firestore = useFirestore();

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'galleryImages'), orderBy('uploadedAt', 'desc'));
  }, [firestore]);

  const { data: images, isLoading } = useCollection(galleryQuery);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !imageUrl || !caption) return;

    setIsAdding(true);
    try {
      await addDoc(collection(firestore, 'galleryImages'), {
        imageUrl,
        caption,
        uploadedAt: serverTimestamp(),
        isFeatured: false,
        displayOrder: images ? images.length : 0,
      });
      setImageUrl('');
      setCaption('');
    } catch (error) {
      console.error("Error adding image:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'galleryImages', id));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-900">Gallery Management</h1>
          <p className="text-slate-500 mt-1">Add or remove images from the public visual portfolio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Image Form */}
        <Card className="lg:col-span-1 border-none shadow-md rounded-2xl overflow-hidden h-fit sticky top-8">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Image
            </CardTitle>
            <CardDescription className="text-white/70">Enter image details to update the gallery.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAddImage} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Image URL</Label>
                <Input 
                  placeholder="https://images.unsplash.com/..." 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-11 border-2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Caption</Label>
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
                className="w-full h-12 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest"
              >
                {isAdding ? <Loader2 className="animate-spin w-5 h-5" /> : 'Add to Gallery'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Image Grid */}
        <Card className="lg:col-span-2 border-none shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100">
            <CardTitle className="text-xl font-headline font-bold">Current Portfolio</CardTitle>
            <CardDescription>Real-time view of your public gallery.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : !images || images.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">No images in gallery yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="group relative rounded-xl overflow-hidden bg-slate-100 aspect-square">
                    <Image 
                      src={image.imageUrl} 
                      alt={image.caption} 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-white font-bold text-sm mb-2">{image.caption}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteImage(image.id)}
                          className="flex-1 h-9 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-9 w-9 p-0"
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
