
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
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
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { defaultHomepageSections } from '@/lib/placeholder-data';


interface FeaturedCategory {
  id: string;
  name: string;
  image: string;
}

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Category name is required'),
  image: z.union([z.instanceof(File).optional(), z.string().optional()]),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const SETTINGS_DOC_PATH = 'public_content/homepage';

export default function HomepageSettingsPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<FeaturedCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FeaturedCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<FeaturedCategory | null>(null);

    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema)
    });

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const docRef = doc(db, SETTINGS_DOC_PATH);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const featuredCategoriesSection = data.sections?.find((s: any) => s.type === 'featured-categories');
                setCategories(featuredCategoriesSection?.content || []);
            } else {
                 const defaultFeaturedCategories = defaultHomepageSections.find(s => s.type === 'featured-categories');
                 setCategories(defaultFeaturedCategories?.content || []);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load categories.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenForm = (category?: FeaturedCategory) => {
        if (category) {
            setEditingCategory(category);
            form.reset({ name: category.name, image: category.image });
        } else {
            setEditingCategory(null);
            form.reset({ id: `cat-${Date.now()}`, name: '', image: undefined });
        }
        setIsFormOpen(true);
    };

    const handleSaveChanges = async (allCategories: FeaturedCategory[]) => {
        setIsSubmitting(true);
        try {
            const docRef = doc(db, SETTINGS_DOC_PATH);
            const docSnap = await getDoc(docRef);
            const existingData = docSnap.exists() ? docSnap.data() : { sections: defaultHomepageSections };
            
            const updatedSections = existingData.sections.map((section: any) => {
                if (section.type === 'featured-categories') {
                    return { ...section, content: allCategories };
                }
                return section;
            });
            
            await setDoc(docRef, { ...existingData, sections: updatedSections }, { merge: true });
            setCategories(allCategories);
            toast({ title: 'Success', description: 'Homepage settings updated successfully.' });
        } catch (error) {
            console.error("Error updating document:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not update homepage settings.' });
        } finally {
            setIsSubmitting(false);
        }
    }

    const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
        setIsSubmitting(true);
        let imageUrl = editingCategory?.image || '';
        
        try {
            if (data.image instanceof File) {
                const file = data.image;
                const storageRef = ref(storage, `homepage/categories/${Date.now()}-${file.name}`);
                const uploadResult = await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(uploadResult.ref);
            }
            
            const newCategoryData: FeaturedCategory = {
                id: editingCategory?.id || data.id || `cat-${Date.now()}`,
                name: data.name,
                image: imageUrl,
            };

            let updatedCategories;
            if (editingCategory) {
                updatedCategories = categories.map(c => c.id === editingCategory.id ? newCategoryData : c);
            } else {
                updatedCategories = [...categories, newCategoryData];
            }
            
            await handleSaveChanges(updatedCategories);
            setIsFormOpen(false);

        } catch (error: any) {
            console.error("Error saving category:", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not save the category.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async () => {
        if (!categoryToDelete) return;
        const updatedCategories = categories.filter(c => c.id !== categoryToDelete.id);
        await handleSaveChanges(updatedCategories);
        setCategoryToDelete(null);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Homepage Featured Categories</CardTitle>
                            <CardDescription>Manage the categories shown on the homepage.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenForm()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categories.map((cat) => (
                                <Card key={cat.id} className="overflow-hidden">
                                    <div className="aspect-square relative bg-secondary">
                                        <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold truncate">{cat.name}</h3>
                                        <div className="flex gap-2 mt-2">
                                            <Button size="sm" variant="outline" className="w-full" onClick={() => handleOpenForm(cat)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                            <Button size="sm" variant="destructive" className="w-full" onClick={() => setCategoryToDelete(cat)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name</Label>
                                <Input id="name" {...form.register("name")} />
                                {form.formState.errors.name && <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Image</Label>
                                <Input id="image" type="file" accept="image/*" onChange={(e) => form.setValue('image', e.target.files?.[0])} />
                                {editingCategory?.image && !form.getValues('image') && (
                                    <div className="text-sm text-muted-foreground mt-2">
                                        Current image: <Image src={editingCategory.image} alt="current" width={40} height={40} className="inline-block h-10 w-10 object-cover rounded-md" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the category "{categoryToDelete?.name}". This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
