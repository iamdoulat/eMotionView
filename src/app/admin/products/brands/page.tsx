
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import type { Brand } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, docToJSON } from "@/lib/firebase";

const brandSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Brand name is required"),
  permalink: z.string().optional(),
  logo: z.string().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });
  
  const [isPermalinkManuallyEdited, setIsPermalinkManuallyEdited] = useState(false);
  const brandName = watch('name');

  useEffect(() => {
    if (!isPermalinkManuallyEdited && brandName) {
      const generatedPermalink = brandName
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setValue('permalink', generatedPermalink);
    }
  }, [brandName, isPermalinkManuallyEdited, setValue]);
  
  useEffect(() => {
    const fetchBrands = async () => {
        setIsLoading(true);
        try {
            const brandsSnapshot = await getDocs(collection(db, 'brands'));
            setBrands(brandsSnapshot.docs.map(docToJSON) as Brand[]);
        } catch (error) {
            console.error("Failed to fetch brands:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load brand data.' });
        } finally {
            setIsLoading(false);
        }
    };
    fetchBrands();
  }, [toast]);

  const handleOpenForm = (brand?: Brand) => {
    setBrandToEdit(brand || null);
    if (brand) {
        reset(brand);
        setIsPermalinkManuallyEdited(true);
    } else {
        reset({ name: "", logo: "", permalink: "" });
        setIsPermalinkManuallyEdited(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setBrandToEdit(null);
    setIsFormOpen(false);
  };

  const handleSaveBrand: SubmitHandler<BrandFormData> = async (data) => {
    setIsSubmitting(true);
    try {
        const payload = { ...data, logo: data.logo || "https://placehold.co/100x40.png" };
        if (brandToEdit) {
            const docRef = doc(db, 'brands', brandToEdit.id);
            await setDoc(docRef, payload, { merge: true });
            setBrands(brands.map(b => b.id === brandToEdit.id ? { ...b, ...payload } : b));
            toast({ title: "Success", description: "Brand updated successfully." });
        } else {
            const docRef = await addDoc(collection(db, 'brands'), payload);
            setBrands([...brands, { ...payload, id: docRef.id }]);
            toast({ title: "Success", description: "New brand created." });
        }
        handleCloseForm();
    } catch (error) {
        console.error("Error saving brand:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not save the brand." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;
    try {
        await deleteDoc(doc(db, 'brands', brandToDelete.id));
        setBrands(brands.filter(b => b.id !== brandToDelete.id));
        toast({ title: "Success", description: "Brand deleted." });
    } catch (error) {
        console.error("Error deleting brand:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not delete brand." });
    } finally {
        setBrandToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Brands</CardTitle>
              <CardDescription>Manage your product brands.</CardDescription>
            </div>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Brand Name</TableHead>
                <TableHead>Permalink</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <Image src={brand.logo} alt={brand.name} width={80} height={32} className="object-contain" data-ai-hint="brand logo" />
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-muted-foreground">/brand/{brand.permalink}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenForm(brand)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setBrandToDelete(brand)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{brands.length}</strong> of <strong>{brands.length}</strong> brands.
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{brandToEdit ? "Edit Brand" : "Add New Brand"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the brand.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSaveBrand)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input id="name" {...register("name")} disabled={isSubmitting} />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="permalink">Permalink</Label>
                <Input id="permalink" {...register("permalink")} onChange={(e) => { setIsPermalinkManuallyEdited(true); setValue('permalink', e.target.value); }} disabled={isSubmitting} />
                {errors.permalink && <p className="text-destructive text-sm">{errors.permalink.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <Input id="logo" type="file" disabled />
                <p className="text-sm text-muted-foreground">Image upload is for demonstration only.</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Brand
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!brandToDelete} onOpenChange={(open) => !open && setBrandToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the brand "{brandToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBrand} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
