
"use client";

import { useState } from "react";
import { products as initialProducts, Product } from "@/lib/placeholder-data";
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
  DialogTrigger,
  DialogFooter,
  DialogClose
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    originalPrice: z.coerce.number().optional(),
    category: z.string().min(1, "Category is required"),
    brand: z.string().min(1, "Brand is required"),
    sku: z.string().min(1, "SKU is required"),
    stock: z.coerce.number().min(0, "Stock must be a positive number"),
    supplier: z.string().min(1, "Supplier is required"),
    features: z.array(z.object({ value: z.string() })).transform(arr => arr.map(item => item.value)),
    specifications: z.array(z.object({ key: z.string(), value: z.string() })),
    images: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductForm = ({ product, onSave, onCancel }: { product?: ProductFormData, onSave: (data: Product) => void, onCancel: () => void }) => {
    const { register, handleSubmit, control, formState: { errors } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            ...product,
            features: product?.features?.map(f => ({ value: f })) || [{ value: "" }],
            specifications: product?.specifications ? Object.entries(product.specifications).map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }],
        },
    });

    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
        control,
        name: "features" as any,
    });

    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
        control,
        name: "specifications" as any,
    });
    
    const onSubmit: SubmitHandler<ProductFormData> = (data) => {
        const transformedData: Product = {
            ...data,
            id: product?.id || `prod-${Date.now()}`,
            discountPercentage: data.originalPrice && data.price < data.originalPrice ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100) : undefined,
            rating: product ? (product as any).rating : 0,
            reviewCount: product ? (product as any).reviewCount : 0,
            images: product?.images || ['https://placehold.co/600x600.png'],
            specifications: data.specifications.reduce((acc, { key, value }) => {
                if (key) acc[key] = value;
                return acc;
            }, {} as Record<string, string>),
        };
        onSave(transformedData);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input id="name" {...register("name")} />
                            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" {...register("sku")} />
                             {errors.sku && <p className="text-destructive text-sm">{errors.sku.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register("description")} />
                        {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input id="price" type="number" step="0.01" {...register("price")} />
                            {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                            <Input id="originalPrice" type="number" step="0.01" {...register("originalPrice")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" type="number" {...register("stock")} />
                            {errors.stock && <p className="text-destructive text-sm">{errors.stock.message}</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" {...register("category")} />
                            {errors.category && <p className="text-destructive text-sm">{errors.category.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input id="brand" {...register("brand")} />
                            {errors.brand && <p className="text-destructive text-sm">{errors.brand.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Input id="supplier" {...register("supplier")} />
                            {errors.supplier && <p className="text-destructive text-sm">{errors.supplier.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Images</Label>
                         <div className="grid grid-cols-3 gap-2">
                            {product?.images?.map((img, index) => <Image key={index} src={img} alt="product" width={100} height={100} className="rounded-md" />)}
                         </div>
                        <Input type="file" multiple />
                         <p className="text-sm text-muted-foreground">Image upload is for demonstration only.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Features</Label>
                        {featureFields.map((field, index) => (
                             <div key={field.id} className="flex gap-2 items-center">
                                <Input {...register(`features.${index}.value` as const)} placeholder="e.g. 3ATM Water Resistance" />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeFeature(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ value: "" })}>Add Feature</Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Specifications</Label>
                        {specFields.map((field, index) => (
                             <div key={field.id} className="flex gap-2 items-center">
                                <Input {...register(`specifications.${index}.key` as const)} placeholder="Key (e.g. Display)" />
                                <Input {...register(`specifications.${index}.value` as const)} placeholder='Value (e.g. 1.5" IPS Screen)' />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeSpec(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ key: "", value: "" })}>Add Specification</Button>
                    </div>

                </div>
            </ScrollArea>
             <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Product</Button>
            </DialogFooter>
        </form>
    );
};


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleOpenForm = (product?: Product) => {
    setProductToEdit(product || null);
    setIsFormOpen(true);
  }

  const handleCloseForm = () => {
    setProductToEdit(null);
    setIsFormOpen(false);
  }

  const handleSaveProduct = (productData: Product) => {
    if (productToEdit) {
      setProducts(products.map(p => p.id === productData.id ? productData : p));
    } else {
      setProducts([...products, productData]);
    }
    handleCloseForm();
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    setProducts(products.filter(p => p.id !== productToDelete.id));
    setProductToDelete(null);
  }

  return (
    <>
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
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">Stock</TableHead>
              <TableHead className="hidden md:table-cell">SKU</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
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
                  <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">${product.price.toFixed(2)}</TableCell>
                <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
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
                product={productToEdit as ProductFormData | undefined}
                onSave={handleSaveProduct} 
                onCancel={handleCloseForm} 
            />
        </DialogContent>
    </Dialog>

    <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "{productToDelete?.name}".
            </dAlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90">Delete Product</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}