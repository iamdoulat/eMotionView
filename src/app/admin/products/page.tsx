

"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/placeholder-data";
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db, docToJSON } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, View, Loader2 } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { useToast } from "@/hooks/use-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
        setIsLoading(true);
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productList = productsSnapshot.docs.map(docToJSON) as Product[];
        setProducts(productList);
        setIsLoading(false);
    }
    fetchProducts();
  }, []);

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
        setProducts(products.map(p => p.id === productToEdit.id ? { ...productData, id: productToEdit.id } : p));
        toast({ title: "Success", description: "Product updated successfully." });
      } else {
        const { id, ...payload } = productData;
        const docRef = await addDoc(collection(db, 'products'), payload);
        setProducts([...products, { ...payload, id: docRef.id }]);
        toast({ title: "Success", description: "New product created successfully." });
      }
      handleCloseForm();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not save the product." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast({ title: "Success", description: "Product deleted successfully." });
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
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your products here. Add, edit, or delete products.</CardDescription>
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
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                </TableRow>
              ) : products.length > 0 ? products.map((product) => {
                const isStockManaged = product.manageStock ?? true;
                const isInStock = !isStockManaged || product.stock > 0;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.images[0] || "https://placehold.co/64x64.png"}
                        width="64"
                        data-ai-hint="product"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={isInStock ? 'default' : "destructive"}>
                        {isInStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.categories?.map(cat => <Badge key={cat} variant="secondary" className="whitespace-nowrap">{cat}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">${product.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">{isStockManaged ? product.stock : "N/A"}</TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.permalink || product.id}`} target="_blank">
                              <View className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
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
                )
              }) : (
                 <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                        No products found. Consider seeding the database from the dashboard.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{products.length}</strong> of <strong>{products.length}</strong> products
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                  <DialogTitle>{productToEdit ? "Edit Product" : "Add New Product"}</DialogTitle>
                  <DialogDescription>
                      {productToEdit ? "Update the details for this product." : "Fill in the details for the new product."}
                  </DialogDescription>
              </DialogHeader>
              <ProductForm
                  product={productToEdit}
                  onSave={handleSaveProduct}
                  onCancel={handleCloseForm}
                  isSaving={isSaving}
              />
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
