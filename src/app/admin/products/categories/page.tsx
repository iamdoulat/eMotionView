
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Category } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, docToJSON } from "@/lib/firebase";


const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  permalink: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const [isPermalinkManuallyEdited, setIsPermalinkManuallyEdited] = useState(false);
  const categoryName = watch('name');

  useEffect(() => {
    if (!isPermalinkManuallyEdited && categoryName) {
      const generatedPermalink = categoryName
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setValue('permalink', generatedPermalink);
    }
  }, [categoryName, isPermalinkManuallyEdited, setValue]);


  useEffect(() => {
    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const categoriesSnapshot = await getDocs(collection(db, 'categories'));
            const categoryList = categoriesSnapshot.docs.map(doc => docToJSON(doc) as Category);
            setCategories(categoryList);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast({
                variant: 'destructive',
                title: 'Error Fetching Categories',
                description: 'Could not load category data. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    fetchCategories();
  }, [toast]);

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setCategoryToEdit(category);
      reset(category);
      setIsPermalinkManuallyEdited(true);
    } else {
      setCategoryToEdit(null);
      reset({ name: "", permalink: "", description: "" });
      setIsPermalinkManuallyEdited(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setCategoryToEdit(null);
    setIsFormOpen(false);
  };

  const handleSaveCategory: SubmitHandler<CategoryFormData> = async (data) => {
    setIsSubmitting(true);
    try {
        if (categoryToEdit) {
            // Update existing category
            const docRef = doc(db, 'categories', categoryToEdit.id);
            const { id, ...payload } = { ...categoryToEdit, ...data };
            await setDoc(docRef, payload, { merge: true });
            setCategories(categories.map(c => c.id === categoryToEdit.id ? { ...c, ...data } : c));
            toast({ title: "Success", description: "Category updated successfully." });
        } else {
            // Add new category
            const { id, ...payload } = data;
            const docRef = await addDoc(collection(db, 'categories'), payload);
            setCategories([...categories, { ...payload, id: docRef.id }]);
            toast({ title: "Success", description: "New category created successfully." });
        }
        handleCloseForm();
    } catch (error) {
        console.error("Error saving category:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not save the category." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
        await deleteDoc(doc(db, 'categories', categoryToDelete.id));
        setCategories(categories.filter(c => c.id !== categoryToDelete.id));
        toast({ title: "Success", description: "Category deleted successfully." });
    } catch (error) {
        console.error("Error deleting category:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not delete category." });
    } finally {
        setCategoryToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Organize your products into categories.</CardDescription>
            </div>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Permalink</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
              ) : categories.length > 0 ? categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">/category/{category.permalink}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenForm(category)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setCategoryToDelete(category)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No categories found. Start by adding one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>{categories.length}</strong> of <strong>{categories.length}</strong> categories.
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{categoryToEdit ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSaveCategory)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" {...register("name")} disabled={isSubmitting}/>
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="permalink">Permalink</Label>
                <Input
                    id="permalink"
                    {...register("permalink")}
                    onChange={(e) => {
                        setIsPermalinkManuallyEdited(true);
                        setValue('permalink', e.target.value);
                    }}
                    disabled={isSubmitting}
                />
                {errors.permalink && <p className="text-destructive text-sm">{errors.permalink.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} disabled={isSubmitting}/>
                {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {categoryToEdit ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category "{categoryToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
