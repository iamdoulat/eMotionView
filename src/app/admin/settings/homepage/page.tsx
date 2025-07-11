
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useHomepageSettings } from '@/hooks/use-homepage-settings';
import { collection, getDocs } from 'firebase/firestore';
import { db, docToJSON } from '@/lib/firebase';
import type { Category as ProductCategoryType } from '@/lib/placeholder-data';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
    
    const [allProductCategories, setAllProductCategories] = useState<ProductCategoryType[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);

    useEffect(() => {
        const fetchAllCategories = async () => {
            const categoriesSnapshot = await getDocs(collection(db, 'categories'));
            setAllProductCategories(categoriesSnapshot.docs.map(docToJSON) as ProductCategoryType[]);
        };
        fetchAllCategories();
    }, []);

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
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="space-y-4 py-4">
                               <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Category Name</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {allProductCategories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image</FormLabel>
                                            <FormControl>
                                                <Input id="image" type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                                            </FormControl>
                                            {editingCategory?.image && !form.watch('image')?.[0] && (
                                                <div className="text-sm text-muted-foreground mt-2">
                                                    Current image: <Image src={editingCategory.image} alt="current" width={40} height={40} className="inline-block h-10 w-10 object-cover rounded-md" />
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
