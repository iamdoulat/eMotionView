
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { defaultHomepageSections, type Section } from '@/lib/placeholder-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

interface PromoBanner {
  id: string;
  image: string;
  link?: string;
}

const bannerSchema = z.object({
  id: z.string().optional(),
  link: z.string().optional(),
  image: z.union([z.instanceof(FileList).optional(), z.string().optional()]),
});

type BannerFormData = z.infer<typeof bannerSchema>;

const SETTINGS_DOC_PATH = 'public_content/homepage';
const PROMO_SECTION_TYPE = 'promo-banner-pair';

export default function PromoBannersPage() {
    const { toast } = useToast();
    const [banners, setBanners] = useState<PromoBanner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
    const [bannerToDelete, setBannerToDelete] = useState<PromoBanner | null>(null);

    const form = useForm<BannerFormData>({
        resolver: zodResolver(bannerSchema)
    });

    useEffect(() => {
        const fetchBanners = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, SETTINGS_DOC_PATH);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const promoSection = data.sections?.find((s: any) => s.type === PROMO_SECTION_TYPE);
                    setBanners(promoSection?.content || []);
                } else {
                     const defaultPromoSection = defaultHomepageSections.find(s => s.type === PROMO_SECTION_TYPE);
                     setBanners(defaultPromoSection?.content || []);
                }
            } catch (error) {
                console.error("Failed to fetch promo banners:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load promo banners.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchBanners();
    }, [toast]);

    const handleOpenForm = (banner?: PromoBanner) => {
        if (banner) {
            setEditingBanner(banner);
            form.reset({ link: banner.link, image: banner.image });
        } else {
            setEditingBanner(null);
            form.reset({ id: `promo-${Date.now()}`, link: '', image: undefined });
        }
        setIsFormOpen(true);
    };

    const saveChanges = async (allBanners: PromoBanner[]) => {
        setIsSubmitting(true);
        try {
            const docRef = doc(db, SETTINGS_DOC_PATH);
            const docSnap = await getDoc(docRef);
            let existingSections = docSnap.exists() ? docSnap.data().sections : defaultHomepageSections;

            let promoSectionExists = existingSections.some((s: Section) => s.type === PROMO_SECTION_TYPE);
            
            let updatedSections;
            if (promoSectionExists) {
                updatedSections = existingSections.map((section: any) => {
                    if (section.type === PROMO_SECTION_TYPE) {
                        return { ...section, content: allBanners };
                    }
                    return section;
                });
            } else {
                 updatedSections = [...existingSections, {
                    id: 'promo-ban',
                    name: 'Promotional Banners',
                    type: PROMO_SECTION_TYPE,
                    content: allBanners
                 }];
            }
            
            await setDoc(docRef, { sections: updatedSections }, { merge: true });
            setBanners(allBanners);
            toast({ title: 'Success', description: 'Promotional banners updated successfully.' });
        } catch (error) {
            console.error("Error updating document:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not update promo banners.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onFormSubmit: SubmitHandler<BannerFormData> = async (data) => {
        setIsSubmitting(true);
        let imageUrl = editingBanner?.image || '';
        
        try {
            const file = data.image instanceof FileList && data.image.length > 0 ? data.image[0] : undefined;
            if (file) {
                const storageRef = ref(storage, `homepage/promo-banners/${Date.now()}-${file.name}`);
                const uploadResult = await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(uploadResult.ref);
            } else if (!imageUrl && !editingBanner) {
                 toast({ variant: 'destructive', title: 'Error', description: 'An image is required for a new banner.' });
                 setIsSubmitting(false);
                 return;
            }
            
            const newBannerData: PromoBanner = {
                id: editingBanner?.id || data.id || `promo-${Date.now()}`,
                link: data.link,
                image: imageUrl,
            };

            let updatedBanners;
            if (editingBanner) {
                updatedBanners = banners.map(b => b.id === editingBanner.id ? newBannerData : b);
            } else {
                updatedBanners = [...banners, newBannerData];
            }
            
            await saveChanges(updatedBanners);
            setIsFormOpen(false);
        } catch (error: any) {
            console.error("Error saving banner:", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not save the banner.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteConfirm = async () => {
        if (!bannerToDelete) return;
        const updatedBanners = banners.filter(c => c.id !== bannerToDelete.id);
        await saveChanges(updatedBanners);
        setBannerToDelete(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Promotional Banners</CardTitle>
                            <CardDescription>Manage the 800x400 promo banners on the homepage.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenForm()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Banner
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <Skeleton className="h-48 w-full" />
                           <Skeleton className="h-48 w-full" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {banners.map((banner) => (
                               <Card key={banner.id} className="p-4 flex flex-col items-start gap-4">
                                   <Image src={banner.image} alt="Promo Banner" width={800} height={400} className="rounded-md object-cover w-full h-auto" />
                                   <div className="flex items-center justify-between w-full">
                                        <p className="text-sm text-muted-foreground truncate">
                                            Link: {banner.link || 'Not set'}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenForm(banner)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setBannerToDelete(banner)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </Button>
                                        </div>
                                   </div>
                               </Card>
                           ))}
                        </div>
                    )}
                     { !isLoading && banners.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">No promo banners have been added yet.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onFormSubmit)}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="link">Link (Optional)</Label>
                                <Input id="link" {...form.register("link")} placeholder="/products/some-category" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Image (800x400 recommended)</Label>
                                <Input id="image" type="file" accept="image/*" {...form.register('image')} />
                                {editingBanner?.image && !form.watch('image') && (
                                    <div className="text-sm text-muted-foreground mt-2">
                                        <p>Current image:</p>
                                        <Image src={editingBanner.image} alt="current" width={200} height={100} className="mt-1 object-cover rounded-md border" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Banner
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!bannerToDelete} onOpenChange={(open) => !open && setBannerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this promotional banner. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBannerToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
