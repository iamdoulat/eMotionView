

"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Supplier } from "@/lib/placeholder-data";
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

const supplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Supplier name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  permalink: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });

  const [isPermalinkManuallyEdited, setIsPermalinkManuallyEdited] = useState(false);
  const supplierName = watch('name');

  useEffect(() => {
    if (!isPermalinkManuallyEdited && supplierName) {
      const generatedPermalink = supplierName
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setValue('permalink', generatedPermalink);
    }
  }, [supplierName, isPermalinkManuallyEdited, setValue]);
  
  useEffect(() => {
    const fetchSuppliers = async () => {
        setIsLoading(true);
        try {
            const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
            setSuppliers(suppliersSnapshot.docs.map(docToJSON) as Supplier[]);
        } catch (error) {
            console.error("Failed to fetch suppliers:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load supplier data.' });
        } finally {
            setIsLoading(false);
        }
    };
    fetchSuppliers();
  }, [toast]);

  const handleOpenForm = (supplier?: Supplier) => {
    setSupplierToEdit(supplier || null);
    if (supplier) {
        reset(supplier);
        setIsPermalinkManuallyEdited(true);
    } else {
        reset({ name: "", contactPerson: "", email: "", permalink: "" });
        setIsPermalinkManuallyEdited(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSupplierToEdit(null);
    setIsFormOpen(false);
  };

  const handleSaveSupplier: SubmitHandler<SupplierFormData> = async (data) => {
    setIsSubmitting(true);
    try {
        if (supplierToEdit) {
            const docRef = doc(db, 'suppliers', supplierToEdit.id);
            await setDoc(docRef, data, { merge: true });
            setSuppliers(suppliers.map(s => s.id === supplierToEdit.id ? { ...s, ...data } : s));
            toast({ title: "Success", description: "Supplier updated successfully." });
        } else {
            const docRef = await addDoc(collection(db, 'suppliers'), data);
            setSuppliers([...suppliers, { ...data, id: docRef.id }]);
            toast({ title: "Success", description: "New supplier created." });
        }
        handleCloseForm();
    } catch (error) {
        console.error("Error saving supplier:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not save the supplier." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    try {
        await deleteDoc(doc(db, 'suppliers', supplierToDelete.id));
        setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id));
        toast({ title: "Success", description: "Supplier deleted." });
    } catch (error) {
        console.error("Error deleting supplier:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not delete supplier." });
    } finally {
        setSupplierToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>Manage your product suppliers.</CardDescription>
            </div>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permalink</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell className="text-muted-foreground">/supplier/{supplier.permalink}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenForm(supplier)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setSupplierToDelete(supplier)}>
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
            Showing <strong>1-{suppliers.length}</strong> of <strong>{suppliers.length}</strong> suppliers.
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{supplierToEdit ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the supplier.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSaveSupplier)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name</Label>
                <Input id="name" {...register("name")} disabled={isSubmitting} />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="permalink">Permalink</Label>
                <Input id="permalink" {...register("permalink")} onChange={(e) => { setIsPermalinkManuallyEdited(true); setValue('permalink', e.target.value); }} disabled={isSubmitting} />
                {errors.permalink && <p className="text-destructive text-sm">{errors.permalink.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" {...register("contactPerson")} disabled={isSubmitting} />
                {errors.contactPerson && <p className="text-destructive text-sm">{errors.contactPerson.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} disabled={isSubmitting} />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Supplier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!supplierToDelete} onOpenChange={(open) => !open && setSupplierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier "{supplierToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSupplier} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
