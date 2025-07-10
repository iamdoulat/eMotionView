
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import NextImage from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, Edit, Trash2, GripVertical } from "lucide-react";
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { defaultHeroBanners, type HeroBanner } from '@/lib/placeholder-data';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


const heroSchema = z.object({
  id: z.coerce.number().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  buttonText: z.string().optional(),
  link: z.string().optional(),
  image: z.union([z.instanceof(FileList).optional(), z.string().optional()]),
});

type HeroFormData = z.infer<typeof heroSchema>;

const SETTINGS_DOC_PATH = 'public_content/homepage';


function SortableBannerItem({ banner, onEdit, onDelete }: { banner: HeroBanner; onEdit: (banner: HeroBanner) => void; onDelete: (banner: HeroBanner) => void; }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: banner.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    return (
        <AccordionItem ref={setNodeRef} style={style} value={String(banner.id)} className="bg-background border rounded-md mb-2 overflow-hidden">
            <AccordionTrigger className="font-semibold hover:no-underline p-4">
                <div className="flex items-center gap-4">
                    <div {...attributes} {...listeners} className="cursor-grab p-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <NextImage src={banner.image} alt={banner.headline || 'Hero Banner'} width={60} height={34} className="rounded-md object-cover h-9 w-16" />
                    <span>{banner.headline || "Untitled Banner"}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex items-start justify-between p-4 bg-secondary/50 border-t">
                    <div className="space-y-4">
                         {banner.subheadline && (
                             <div>
                                <p className="text-sm font-semibold">Subheadline:</p>
                                <p className="text-sm text-muted-foreground">{banner.subheadline}</p>
                             </div>
                         )}
                         {banner.buttonText && (
                             <div>
                                <p className="text-sm font-semibold">Button:</p>
                                <p className="text-sm text-muted-foreground">{banner.buttonText} (links to {banner.link || '#'})</p>
                             </div>
                         )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 ml-4">
                        <Button size="sm" variant="outline" onClick={() => onEdit(banner)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(banner)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export default function HomepageHeroSettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
    const [bannerToDelete, setBannerToDelete] = useState<HeroBanner | null>(null);

    const form = useForm<HeroFormData>({
        resolver: zodResolver(heroSchema)
    });

    const fetchHeroData = useCallback(async () => {
        setIsLoading(true);
        try {
            const docRef = doc(db, SETTINGS_DOC_PATH);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data()?.heroBanners) {
                setBanners(docSnap.data().heroBanners);
            } else {
                 setBanners(defaultHeroBanners);
            }
        } catch (error) {
            console.error("Failed to fetch hero data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load hero data.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchHeroData();
    }, [fetchHeroData]);

    const handleOpenForm = (banner?: HeroBanner) => {
        if (banner) {
            setEditingBanner(banner);
            form.reset({
                ...banner,
                image: banner.image
            });
        } else {
            setEditingBanner(null);
            form.reset({ id: Date.now(), headline: '', subheadline: '', buttonText: '', link: '', image: undefined });
        }
        setIsFormOpen(true);
    };
    
    const handleSaveChanges = async (allBanners: HeroBanner[]) => {
        setIsSubmitting(true);
        try {
            const docRef = doc(db, SETTINGS_DOC_PATH);
            await setDoc(docRef, { heroBanners: allBanners }, { merge: true });
            setBanners(allBanners);
            toast({ title: 'Success', description: 'Homepage hero banners updated successfully.' });
        } catch (error) {
            console.error("Error updating document:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not update hero settings.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const onFormSubmit: SubmitHandler<HeroFormData> = async (data) => {
        setIsSubmitting(true);
        let imageUrl = editingBanner?.image || '';
        
        try {
            if (data.image instanceof FileList && data.image.length > 0) {
                const file = data.image[0];
                const storageRef = ref(storage, `homepage/hero/${Date.now()}-${file.name}`);
                const uploadResult = await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(uploadResult.ref);
            } else if (!imageUrl) {
                 toast({ variant: 'destructive', title: 'Error', description: 'An image is required for the hero banner.' });
                 setIsSubmitting(false);
                 return;
            }
            
            const newBannerData: HeroBanner = {
                id: editingBanner?.id || data.id || Date.now(),
                headline: data.headline,
                subheadline: data.subheadline,
                buttonText: data.buttonText,
                link: data.link,
                image: imageUrl,
            };

            let updatedBanners;
            if (editingBanner) {
                updatedBanners = banners.map(c => c.id === editingBanner.id ? newBannerData : c);
            } else {
                updatedBanners = [...banners, newBannerData];
            }
            
            await handleSaveChanges(updatedBanners);
            setIsFormOpen(false);
        } catch (error: any) {
            console.error("Error saving banner:", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not save the banner.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async () => {
        if (!bannerToDelete) return;
        const updatedBanners = banners.filter(c => c.id !== bannerToDelete.id);
        await handleSaveChanges(updatedBanners);
        setBannerToDelete(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (over && active.id !== over.id) {
            const oldIndex = banners.findIndex((b) => b.id === active.id);
            const newIndex = banners.findIndex((b) => b.id === over.id);
            const newOrder = arrayMove(banners, oldIndex, newIndex);
            setBanners(newOrder); // Optimistically update UI
            handleSaveChanges(newOrder); // Persist changes
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Homepage Hero Section</CardTitle>
                            <CardDescription>Manage the banners in your homepage hero carousel.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenForm()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Hero Banner
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                           {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                        </div>
                    ) : banners.length > 0 ? (
                        <DndContext sensors={[]} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                            <SortableContext items={banners} strategy={verticalListSortingStrategy}>
                                <Accordion type="single" collapsible className="w-full space-y-2">
                                   {banners.map((banner) => (
                                       <SortableBannerItem key={banner.id} banner={banner} onEdit={handleOpenForm} onDelete={setBannerToDelete} />
                                   ))}
                                </Accordion>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No hero banners created yet.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingBanner ? "Edit Hero Banner" : "Add New Hero Banner"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onFormSubmit)}>
                            <div className="space-y-4 py-4">
                               <FormField control={form.control} name="headline" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Headline (Optional)</FormLabel>
                                    <FormControl><Input placeholder="e.g. GADGET FEST" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                               <FormField control={form.control} name="subheadline" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Subheadline (Optional)</FormLabel>
                                    <FormControl><Input placeholder="e.g. Up to 60% off..." {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                               <FormField control={form.control} name="buttonText" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Button Text (Optional)</FormLabel>
                                    <FormControl><Input placeholder="e.g. Shop Now" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                               <FormField control={form.control} name="link" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Button Link (Optional)</FormLabel>
                                    <FormControl><Input placeholder="e.g. /products" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                               <FormField control={form.control} name="image" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Background Image</FormLabel>
                                        <FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                {editingBanner?.image && !form.watch('image')?.[0] && (
                                    <div className="text-sm text-muted-foreground mt-2">
                                        <Label>Current image:</Label>
                                        <NextImage src={editingBanner.image} alt="current" width={80} height={45} className="mt-1 h-16 w-32 object-cover rounded-md border" />
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!bannerToDelete} onOpenChange={(open) => !open && setBannerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the hero banner "{bannerToDelete?.headline}". This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBannerToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
