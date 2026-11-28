

"use client";

import { useState, useEffect, useMemo } from "react";
import type { Product } from "@/lib/placeholder-data";
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, docToJSON } from "@/lib/db";
import { db } from '@/lib/db';
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, View, Loader2, Package } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brandsCount, setBrandsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const [productsSnapshot, brandsSnapshot] = await Promise.all([
              getDocs(collection(db, 'products')),
              getDocs(collection(db, 'brands')).catch(() => ({ docs: [] } as any)),
            ]);
            const productList = productsSnapshot.docs.map(docToJSON) as Product[];
            setProducts(productList);

            const dbBrands = brandsSnapshot?.docs?.length || 0;
            const prodBrands = new Set(productList.map((p) => p.brand).filter(Boolean)).size;
            setBrandsCount(Math.max(dbBrands, prodBrands));
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    }
    fetchProducts();
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const prodBrands = new Set(products.map((p) => p.brand).filter(Boolean)).size;
    const totalBrands = Math.max(brandsCount, prodBrands);

    const inStock = products.filter((p) => !p.manageStock || (Number(p.stock) || 0) > 5).length;
    const lowStock = products.filter((p) => p.manageStock && (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 5).length;
    const outOfStock = products.filter((p) => p.manageStock && (Number(p.stock) || 0) <= 0).length;

    return {
      totalProducts,
      totalQuantity,
      totalBrands,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [products, brandsCount]);

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
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Package className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">Products</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Manage your products here. Add, edit, or delete products.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3.5 flex-wrap sm:flex-nowrap shrink-0 ml-auto">
              {/* 2x3 Stat Badges Grid (Matching User Diagram) */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* Total Products */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border bg-secondary/40 min-w-[110px] shadow-2xs">
                  <span className="text-[11px] text-muted-foreground font-medium">Products</span>
                  <strong className="text-foreground font-bold font-mono text-xs">{stats.totalProducts}</strong>
                </div>

                {/* Total Quantity */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border bg-secondary/40 min-w-[110px] shadow-2xs">
                  <span className="text-[11px] text-muted-foreground font-medium">Total Qty</span>
                  <strong className="text-foreground font-bold font-mono text-xs">{stats.totalQuantity}</strong>
                </div>

                {/* Total Brands */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border bg-secondary/40 min-w-[110px] shadow-2xs">
                  <span className="text-[11px] text-muted-foreground font-medium">Brands</span>
                  <strong className="text-foreground font-bold font-mono text-xs">{stats.totalBrands}</strong>
                </div>

                {/* In Stock */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 min-w-[110px] shadow-2xs">
                  <span className="text-[11px] font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                    In Stock
                  </span>
                  <strong className="font-bold font-mono text-xs text-emerald-700 dark:text-emerald-300">{stats.inStock}</strong>
                </div>

                {/* Low Stock */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 min-w-[110px] shadow-2xs">
                  <span className="text-[11px] font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                    Low Stock
                  </span>
                  <strong className="font-bold font-mono text-xs text-amber-700 dark:text-amber-300">{stats.lowStock}</strong>
                </div>

                {/* Out of Stock */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 min-w-[110px] shadow-2xs">
                  <span className="text-[11px] font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
                    Out of Stock
                  </span>
                  <strong className="font-bold font-mono text-xs text-rose-700 dark:text-rose-300">{stats.outOfStock}</strong>
                </div>
              </div>

              {/* Add Product Button */}
              <Button onClick={() => handleOpenForm()} className="h-10 px-4 font-semibold shadow-xs shrink-0 cursor-pointer">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
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
              ) : products.length > 0 ? products.map((product, index) => {
                const isStockManaged = product.manageStock ?? true;
                const isInStock = !isStockManaged || product.stock > 0;
                const safeKey =
                  product.id && product.id !== '[object Object]'
                    ? product.id
                    : (product as any)._id && String((product as any)._id) !== '[object Object]'
                    ? String((product as any)._id)
                    : product.permalink
                    ? `${product.permalink}-${index}`
                    : `product-${index}`;
                
                return (
                  <TableRow key={safeKey}>
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
                    <TableCell>
                      <Badge variant={isInStock ? 'default' : "destructive"}>
                        {isInStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.categories?.map((cat, catIdx) => {
                          const catName = typeof cat === 'string' ? cat : (cat as any)?.name || String(cat);
                          return (
                            <Badge key={`${safeKey}-cat-${catIdx}-${catName}`} variant="secondary" className="whitespace-nowrap">
                              {catName}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-medium">{formatPrice(product.price)}</TableCell>
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
                    {productToEdit ? `Edit Product: ${productToEdit.name}` : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {productToEdit
                      ? "Update product details, pricing, stock levels, images, and technical specifications."
                      : "Fill in the product information, set pricing, upload images, and publish to catalog."}
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
                  <Badge variant={productToEdit.productType === 'Digital' ? 'secondary' : 'default'} className="text-[11px]">
                    {productToEdit.productType || 'Physical'}
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
