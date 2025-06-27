
"use client";

import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product } from "@/lib/placeholder-data";
import { categories, brands, suppliers, attributes } from "@/lib/placeholder-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Product name is required"),
    permalink: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    originalPrice: z.coerce.number().optional(),
    category: z.string().min(1, "Category is required"),
    brand: z.string().min(1, "Brand is required"),
    sku: z.string().min(1, "SKU is required"),
    stock: z.coerce.number().min(0, "Stock must be a positive number"),
    supplier: z.string().min(1, "Supplier is required"),
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
    onSave: (data: Product) => void;
    onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: product ? {
            ...product,
            permalink: product.permalink || '',
            productType: product.productType || 'Physical',
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
            category: "",
            brand: "",
            sku: "",
            stock: 0,
            supplier: "",
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

    const { register, handleSubmit, control, formState: { errors } } = form;

    const [isPermalinkManuallyEdited, setIsPermalinkManuallyEdited] = useState(!!product?.id);
    const productName = form.watch('name');

    useEffect(() => {
        if (!isPermalinkManuallyEdited && productName) {
            const generatedPermalink = productName
                .toLowerCase()
                .trim()
                .replace(/&/g, 'and')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            form.setValue('permalink', generatedPermalink, { shouldValidate: true });
        }
    }, [productName, isPermalinkManuallyEdited, form]);


    const productType = form.watch('productType');

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


    const onSubmit: SubmitHandler<ProductFormData> = (data) => {
        const specObject: Record<string, string> = {};
        data.specifications.forEach(spec => {
            if (spec.key) {
                specObject[spec.key] = spec.value;
            }
        });

        const transformedData: Product = {
            ...data,
            id: product?.id || "",
            rating: product?.rating || 0,
            reviewCount: product?.reviewCount || 0,
            images: product?.images || ['https://placehold.co/600x600.png'],
            features: data.features.map(f => f.value),
            specifications: specObject,
            productAttributes: data.productAttributes,
            points: data.points,
            discountPercentage: data.originalPrice && data.price < data.originalPrice ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100) : undefined,
            downloadUrl: data.downloadUrl || undefined,
            digitalProductNote: data.digitalProductNote || undefined,
        };
        onSave(transformedData);
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
                                    onValueChange={field.onChange}
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
                                    <Textarea id="digitalProductNote" {...register("digitalProductNote")} placeholder="e.g. Your download link will expire in 48 hours." />
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
                                <Input id="sku" {...register("sku")} />
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
                                    form.setValue('permalink', e.target.value);
                                }}
                            />
                            {errors.permalink && <p className="text-destructive text-sm">{errors.permalink.message}</p>}
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register("description")} />
                            {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
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
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <Input id="stock" type="number" {...register("stock")} />
                                {errors.stock && <p className="text-destructive text-sm">{errors.stock.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="points">Club Points</Label>
                                <Input id="points" type="number" {...register("points")} placeholder="e.g. 100" />
                                {errors.points && <p className="text-destructive text-sm">{errors.points.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
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
                                                {brands.map(brand => <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
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
                                                {suppliers.map(sup => <SelectItem key={sup.id} value={sup.name}>{sup.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Images</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {product?.images?.map((img, index) => <Image key={index} src={img} alt="product" width={100} height={100} className="rounded-md" data-ai-hint="product image" />)}
                            </div>
                            <Input type="file" multiple />
                            <p className="text-sm text-muted-foreground">Image upload is for demonstration only.</p>
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
                            <Label>Product Attributes</Label>
                            <div className="space-y-4">
                                {attributeFields.map((field, index) => {
                                    const attributeName = form.watch(`productAttributes.${index}.name`);
                                    const availableValues = attributes.find(a => a.name === attributeName)?.values || [];
                                    const selectedValues = form.watch(`productAttributes.${index}.values`) || [];
                                    
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
                                                                        form.setValue(`productAttributes.${index}.values`, []);
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
                                                                            <SelectItem key={attr.id} value={attr.name}>{attr.name}</SelectItem>
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
                                                                            form.setValue(`productAttributes.${index}.values`, newValues, { shouldValidate: true });
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
                    <Button type="submit">Save Product</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};
