
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useHomepageSettings } from '@/hooks/use-homepage-settings';

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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Category name is required'),
  image: z.union([z.instanceof(FileList).optional(), z.string().optional()]),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function HomepageSettingsPage() {
    const {
        categories,
        isLoading,
        isSubmitting,
        addCategory,
        updateCategory,
        deleteCategory
    } = useHomepageSettings();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);

    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema)
    });

    const handleOpenForm = (category?: any) => {
        if (category) {
            setEditingCategory(category);
            form.reset({ name: category.name, image: category.image });
        } else {
            setEditingCategory(null);
            form.reset({ id: `cat-${Date.now()}`, name: '', image: undefined });
        }
        setIsFormOpen(true);
    };

    const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
        const file = data.image instanceof FileList && data.image.length > 0 ? data.image[0] : undefined;
        
        if (editingCategory) {
            await updateCategory(editingCategory, data.name, file);
        } else {
            await addCategory(data.name, file);
        }
        setIsFormOpen(false);
    };
    
    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;
        await deleteCategory(categoryToDelete.id);
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
                        <div className="space-y-2">
                           {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                           {categories.map((cat) => (
                               <AccordionItem key={cat.id} value={cat.id}>
                                   <AccordionTrigger className="font-semibold hover:no-underline">
                                       <div className="flex items-center gap-4">
                                            <Image src={cat.image} alt={cat.name} width={40} height={40} className="rounded-md object-cover h-10 w-10" />
                                            <span>{cat.name}</span>
                                       </div>
                                   </AccordionTrigger>
                                   <AccordionContent>
                                       <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-md">
                                           <div>
                                               <p className="text-sm text-muted-foreground">Image Preview:</p>
                                                <Image src={cat.image} alt={cat.name} width={100} height={100} className="rounded-md object-cover mt-2 border" />
                                           </div>
                                            <div className="flex flex-col gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleOpenForm(cat)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => setCategoryToDelete(cat)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </Button>
                                            </div>
                                       </div>
                                   </AccordionContent>
                               </AccordionItem>
                           ))}
                        </Accordion>
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
                                <Input id="image" type="file" accept="image/*" {...form.register('image')} />
                                {editingCategory?.image && !form.watch('image') && (
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
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
