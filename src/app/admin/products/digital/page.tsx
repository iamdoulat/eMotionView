

"use client";

import { useState, useMemo, useEffect } from "react";
import type { Product } from "@/lib/placeholder-data";
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, docToJSON } from "@/lib/db";
import { db } from '@/lib/db';
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function DigitalProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productList = productsSnapshot.docs.map(docToJSON) as Product[];
        setAllProducts(productList);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    }
    fetchProducts();
  }, []);

  const digitalProducts = useMemo(() => allProducts.filter(p => p.productType === 'Digital'), [allProducts]);

  const handleOpenForm = (product?: Product) => {
    setProductToEdit(product || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setProductToEdit(null);
    setIsFormOpen(false);
  };

  const handleSaveProduct = async (productData: Product) => {
    setIsSaving(true);
    try {
      if (productToEdit) {
        const docRef = doc(db, 'products', productToEdit.id);
        await setDoc(docRef, productData, { merge: true });
        setAllProducts(allProducts.map(p => p.id === productToEdit.id ? { ...productData, id: productToEdit.id } : p));
        toast({ title: "Success", description: "Product updated successfully." });
      } else {
        const { id, ...payload } = productData;
        const docRef = await addDoc(collection(db, 'products'), payload);
        setAllProducts([...allProducts, { ...payload, id: docRef.id }]);
        toast({ title: "Success", description: "New digital product created successfully." });
      }
      handleCloseForm();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        variant: 'destructive',
        title: "Error Saving Product",
        description: error?.message || "Could not save the product to catalog.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      setAllProducts(allProducts.filter(p => p.id !== productToDelete.id));
      toast({ title: "Success", description: "Product deleted." });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not delete product." });
    } finally {
      setProductToDelete(null);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Digital Products</CardTitle>
              <CardDescription>Manage your downloadable products and services.</CardDescription>
            </div>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">SKU</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : digitalProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.images[0] || "https://placehold.co/64x64.png"}
                      width="64"
                      unoptimized
                      data-ai-hint="product"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">{product.categories[0]}</TableCell>
                  <TableCell className="hidden md:table-cell">{product.sku}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenForm(product)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setProductToDelete(product)}>
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
            Showing <strong>1-{digitalProducts.length}</strong> of <strong>{digitalProducts.length}</strong> digital products
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl w-[95vw] h-[80vh] max-h-[82vh] max-h-[calc(100vh-6rem)] top-[48%] translate-y-[-48%] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card gap-0">
          <DialogHeader className="px-6 py-4 border-b bg-card shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shadow-xs shrink-0",
                  productToEdit ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary"
                )}>
                  {productToEdit ? <Edit className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                    {productToEdit ? `Edit Digital Product: ${productToEdit.name}` : "Add New Digital Product"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {productToEdit
                      ? "Update digital product details, download links, pricing, and license instructions."
                      : "Fill in the digital product information, attach download URL, set pricing, and publish."}
                  </DialogDescription>
                </div>
              </div>

              {productToEdit && (
                <div className="flex items-center gap-2 flex-wrap">
                  {productToEdit.sku && (
                    <Badge variant="outline" className="font-mono text-[11px] font-semibold">
                      SKU: {productToEdit.sku}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[11px]">
                    Digital Asset
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <ProductForm
              product={productToEdit}
              onSave={handleSaveProduct}
              onCancel={handleCloseForm}
              isSaving={isSaving}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90">Delete Product</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
