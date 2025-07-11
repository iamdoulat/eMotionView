
"use client";

import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product, Category } from "@/lib/placeholder-data";
import { brands, suppliers, attributes } from "@/lib/placeholder-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2, XCircle, Check, ChevronsUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { storage, db, docToJSON } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Textarea } from "../ui/textarea";
import { collection, getDocs } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Product name is required"),
    permalink: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    originalPrice: z.coerce.number().optional(),
    categories: z.array(z.string()).min(1, "At least one category is required."),
    brand: z.string().min(1, "Brand is required"),
    sku: z.string().min(1, "SKU is required"),
    manageStock: z.boolean().default(true),
    stock: z.coerce.number().min(0, "Stock must be a positive number"),
    supplier: z.string().min(1, "Supplier is required"),
    warranty: z.string().optional(),
    points: z.coerce.number().optional(),
    features: z.array(z.object({ value: z.string().min(1, "Feature cannot be empty.") })),
    specifications: z.array(z.object({
        key: z.string().min(1, "Specification key cannot be empty."),
        value: z.string().min(1, "Specification value cannot be empty.")
    })),
    images: z.array(z.string()).default([]),
    productAttributes: z.array(z.object({
        name: z.string().min(1, "Please select an attribute."),
        values: z.array(z.string()).min(1, "Please select at least one value."),
    })).optional(),
    productType: z.enum(['Physical', 'Digital']).default('Physical'),
    downloadUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    digitalProductNote: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    product?: Product | null;
    onSave: (data: Product) => Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
}

export function ProductForm({ product, onSave, onCancel, isSaving }: ProductFormProps) {
    const [dbCategories, setDbCategories] = useState<Category[]>([]);
    
    useEffect(() => {
        const fetchCategories = async () => {
            const categoriesSnapshot = await getDocs(collection(db, 'categories'));
            const categoryList = categoriesSnapshot.docs.map(doc => docToJSON(doc) as Category);
            setDbCategories(categoryList);
        };
        fetchCategories();
    }, []);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: product ? {
            ...product,
            categories: product.categories || [],
            permalink: product.permalink || '',
            productType: product.productType || 'Physical',
            manageStock: product.manageStock ?? (product.productType === 'Physical'),
            warranty: product.warranty || '',
            points: product.points || undefined,
            features: product.features.map(f => ({ value: f })),
            specifications: Object.entries(product.specifications).map(([key, value]) => ({ key, value })),
            productAttributes: product.productAttributes || [],
            downloadUrl: product.downloadUrl || '',
            digitalProductNote: product.digitalProductNote || '',
        } : {
            name: "",
            permalink: "",
            description: "",
            price: 0,
            originalPrice: undefined,
            categories: [],
            brand: "",
            sku: "",
            manageStock: true,
            stock: 0,
            supplier: "",
            warranty: "",
            points: undefined,
            features: [{ value: "" }],
            specifications: [{ key: "", value: "" }],
            images: [],
            productAttributes: [],
            productType: 'Physical',
            downloadUrl: '',
            digitalProductNote: '',
        },
    });

    const { register, handleSubmit, control, formState: { errors }, watch, setValue } = form;

    const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images || []);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

    const [isPermalinkManuallyEdited, setIsPermalinkManuallyEdited] = useState(!!product?.id);
    const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(!!product?.id);
    const productName = watch('name');
    const brandName = watch('brand');

    useEffect(() => {
        if (!isPermalinkManuallyEdited && productName) {
            const generatedPermalink = productName
                .toLowerCase()
                .trim()
                .replace(/&/g, 'and')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setValue('permalink', generatedPermalink, { shouldValidate: true });
        }
    }, [productName, isPermalinkManuallyEdited, setValue]);
    
    useEffect(() => {
        if (!isSkuManuallyEdited && productName && brandName) {
            const brandPart = brandName.substring(0, 4).toUpperCase();
            const namePart = productName
                .split(' ')
                .slice(0, 3)
                .map(word => word[0] || '')
                .join('')
                .toUpperCase();
            
            if (brandPart && namePart) {
                setValue('sku', `${brandPart}-${namePart}`, { shouldValidate: true });
            }
        }
    }, [productName, brandName, isSkuManuallyEdited, setValue]);


    const productType = watch('productType');
    const manageStock = watch('manageStock');

    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
        control,
        name: "features",
    });

    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
        control,
        name: "specifications",
    });

    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({
        control,
        name: "productAttributes",
    });

    const skuRegister = register("sku");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFilesToUpload(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (urlToRemove: string) => {
        if (urlToRemove.startsWith('blob:')) {
            const blobIndex = imagePreviews.filter(p => p.startsWith('blob:')).indexOf(urlToRemove);
            setFilesToUpload(files => files.filter((_, i) => i !== blobIndex));
        } else {
            setImagesToRemove(prev => [...prev, urlToRemove]);
        }
        setImagePreviews(previews => previews.filter(p => p !== urlToRemove));
    };

    const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
        const uploadedImageUrls = await Promise.all(
            filesToUpload.map(async (file) => {
                const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
                await uploadBytes(storageRef, file);
                return getDownloadURL(storageRef);
            })
        );
        
        await Promise.all(
            imagesToRemove.map(async (url) => {
                try {
                    const storageRef = ref(storage, url);
                    await deleteObject(storageRef);
                } catch (error: any) {
                    if (error.code !== 'storage/object-not-found') {
                        console.error("Error deleting image from storage: ", error);
                    }
                }
            })
        );

        const existingUrlsLeft = imagePreviews.filter(p => !p.startsWith('blob:'));
        const finalImageUrls = [...existingUrlsLeft, ...uploadedImageUrls];
        
        const specObject: Record<string, string> = {};
        data.specifications.forEach(spec => {
            if (spec.key) {
                specObject[spec.key] = spec.value;
            }
        });

        const productDataForFirestore = {
            id: product?.id || "",
            name: data.name,
            permalink: data.permalink,
            description: data.description,
            price: data.price,
            originalPrice: data.originalPrice,
            categories: data.categories,
            brand: data.brand,
            sku: data.sku,
            manageStock: data.manageStock,
            stock: data.stock,
            supplier: data.supplier,
            warranty: data.warranty,
            points: data.points,
            productType: data.productType,
            downloadUrl: data.downloadUrl,
            digitalProductNote: data.digitalProductNote,
            productAttributes: data.productAttributes,
            features: data.features.map(f => f.value),
            specifications: specObject,
            images: finalImageUrls.length > 0 ? finalImageUrls : ['https://placehold.co/600x600.png'],
            discountPercentage: (data.originalPrice && data.price < data.originalPrice)
                ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)
                : undefined,
            rating: product?.rating || 0,
            reviewCount: product?.reviewCount || 0,
        };

        // Clean the object: remove any top-level keys with an 'undefined' value before saving.
        Object.keys(productDataForFirestore).forEach(key => {
            if ((productDataForFirestore as any)[key] === undefined) {
                delete (productDataForFirestore as any)[key];
            }
        });

        await onSave(productDataForFirestore as Product);
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ScrollArea className="h-[70vh] pr-6">
                    <div className="space-y-4">
                        <FormField
                            control={control}
                            name="productType"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Product Type</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setValue('manageStock', value === 'Physical');
                                    }}
                                    defaultValue={field.value}
                                    className="flex items-center gap-4"
                                    >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="Physical" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Physical</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="Digital" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Digital</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                </FormItem>
                            )}
                        />

                        {productType === 'Digital' && (
                            <div className="space-y-4 p-4 border border-dashed rounded-md">
                                <h3 className="text-lg font-medium">Digital Product Files</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="downloadUrl">Download URL</Label>
                                    <Input id="downloadUrl" {...register("downloadUrl")} placeholder="https://example.com/your-file.zip" />
                                    {errors.downloadUrl && <p className="text-destructive text-sm">{errors.downloadUrl.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="digitalProductNote">Download Note for Customer</Label>
                                    <Textarea
                                        id="digitalProductNote"
                                        {...register("digitalProductNote")}
                                        placeholder="e.g. Your download link will expire in 48 hours."
                                    />
                                    {errors.digitalProductNote && <p className="text-destructive text-sm">{errors.digitalProductNote.message}</p>}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" {...register("name")} />
                                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                  id="sku"
                                  {...skuRegister}
                                  onChange={(e) => {
                                    skuRegister.onChange(e);
                                    setIsSkuManuallyEdited(true);
                                  }}
                                />
                                {errors.sku && <p className="text-destructive text-sm">{errors.sku.message}</p>}
                            </div>
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
                            />
                            {errors.permalink && <p className="text-destructive text-sm">{errors.permalink.message}</p>}
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                             <FormField
                                control={control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                id="description"
                                                rows={8}
                                                placeholder="Write a detailed description for the product..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Images</Label>
                            <Input id="images" type="file" multiple onChange={handleFileChange} accept="image/*" className="block" disabled={isSaving} />
                            {isSaving && <p className="text-sm text-primary flex items-center gap-2 mt-2"><Loader2 className="animate-spin" /> Uploading images, please wait...</p>}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <Image src={src} alt={`Product image ${index + 1}`} fill className="object-cover rounded-md border" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(src)}
                                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={isSaving}
                                            >
                                                <XCircle className="h-5 w-5" />
                                                <span className="sr-only">Remove image</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input id="price" type="number" step="0.01" {...register("price")} />
                                {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                                <Input id="originalPrice" type="number" step="0.01" {...register("originalPrice")} />
                            </div>
                        </div>

                        <Card className="p-4 bg-secondary/50">
                            <FormField
                                control={control}
                                name="manageStock"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Manage Stock</FormLabel>
                                        <FormDescription>
                                            Enable to track inventory for this product.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={productType === 'Digital'}
                                        />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                            {manageStock && (
                                <div className="mt-4 space-y-2">
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <Input id="stock" type="number" {...register("stock")} />
                                {errors.stock && <p className="text-destructive text-sm">{errors.stock.message}</p>}
                                </div>
                            )}
                        </Card>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={control}
                                name="categories"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Categories</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between",
                                                            !field.value?.length && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <span className="truncate">
                                                            {field.value && field.value.length > 0 ? `${field.value.length} selected` : "Select categories"}
                                                        </span>
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search categories..." />
                                                    <CommandList>
                                                        <CommandEmpty>No categories found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {dbCategories.map((category) => (
                                                                <CommandItem
                                                                    key={category.id}
                                                                    onSelect={() => {
                                                                        const selected = field.value || [];
                                                                        const isSelected = selected.includes(category.name);
                                                                        const newSelection = isSelected
                                                                            ? selected.filter((name) => name !== category.name)
                                                                            : [...selected, category.name];
                                                                        field.onChange(newSelection);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            (field.value || []).includes(category.name) ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {category.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Selected: {field.value?.join(", ") || "None"}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a brand" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {brands.map(brand => <SelectItem key={brand.name} value={brand.name}>{brand.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                         <FormField
                            control={control}
                            name="supplier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Supplier</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a supplier" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {suppliers.map(sup => <SelectItem key={sup.name} value={sup.name}>{sup.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="space-y-2">
                            <Label htmlFor="points">Club Points</Label>
                            <Input id="points" type="number" {...register("points")} placeholder="e.g. 100" />
                            {errors.points && <p className="text-destructive text-sm">{errors.points.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Features</Label>
                            {featureFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-center">
                                    <Input {...register(`features.${index}.value`)} placeholder="e.g. 3ATM Water Resistance" />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeFeature(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ value: "" })}>Add Feature</Button>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="warranty">Warranty Information</Label>
                            <Input id="warranty" {...register("warranty")} placeholder="e.g. 1 Year Brand Warranty" />
                            {errors.warranty && <p className="text-destructive text-sm">{errors.warranty.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Product Attributes</Label>
                            <div className="space-y-4">
                                {attributeFields.map((field, index) => {
                                    const attributeName = watch(`productAttributes.${index}.name`);
                                    const availableValues = attributes.find(a => a.name === attributeName)?.values || [];
                                    const selectedValues = watch(`productAttributes.${index}.values`) || [];
                                    
                                    return (
                                        <Card key={field.id} className="p-4 bg-secondary/50">
                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <FormField
                                                        control={control}
                                                        name={`productAttributes.${index}.name`}
                                                        render={({ field: selectField }) => (
                                                            <FormItem>
                                                                <FormLabel>Attribute</FormLabel>
                                                                <Select 
                                                                    onValueChange={(value) => {
                                                                        selectField.onChange(value);
                                                                        setValue(`productAttributes.${index}.values`, []);
                                                                    }} 
                                                                    defaultValue={selectField.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select an attribute" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {attributes.map(attr => (
                                                                            <SelectItem key={attr.name} value={attr.name}>{attr.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    {attributeName && (
                                                        <div className="space-y-2">
                                                            <Label>Values</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {availableValues.map(value => (
                                                                    <Button
                                                                        type="button"
                                                                        key={value}
                                                                        variant={selectedValues.includes(value) ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const newValues = selectedValues.includes(value)
                                                                                ? selectedValues.filter((v: string) => v !== value)
                                                                                : [...selectedValues, value];
                                                                            setValue(`productAttributes.${index}.values`, newValues, { shouldValidate: true });
                                                                        }}
                                                                    >
                                                                        {value}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                            {errors.productAttributes?.[index]?.values && <p className="text-destructive text-sm">{errors.productAttributes[index]?.values?.message}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button type="button" variant="destructive" size="icon" onClick={() => removeAttribute(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => appendAttribute({ name: '', values: [] })}
                                className="mt-2"
                            >
                                Add Attribute
                            </Button>
                        </div>


                        <div className="space-y-2">
                            <Label>Specifications</Label>
                            {specFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-center">
                                    <Input {...register(`specifications.${index}.key`)} placeholder="Key (e.g. Display)" />
                                    <Input {...register(`specifications.${index}.value`)} placeholder='Value (e.g. 1.5" IPS Screen)' />
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
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Product
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};
