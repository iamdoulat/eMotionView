"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useForm, useFieldArray, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product, Category, Brand, Supplier } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { uploadFile, getFileUrl, deleteFile } from "@/lib/r2";

// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Icons
import {
  Loader2,
  Trash2,
  X,
  XCircle,
  Check,
  ChevronsUpDown,
  Upload,
  Plus,
  Image as ImageIcon,
  Package,
  Layers,
  Sparkles,
  Link2,
  ExternalLink,
  Star,
  ShieldCheck,
  Coins,
  Download,
  AlertCircle,
  FileText,
  Boxes,
  HelpCircle,
  Tag,
  DollarSign,
  Globe,
  ClipboardCopy
} from "lucide-react";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  permalink: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  originalPrice: z.coerce.number().optional(),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  brand: z.string().min(1, "Brand is required"),
  sku: z.string().min(1, "SKU is required"),
  manageStock: z.boolean().default(true),
  stock: z.coerce.number().min(0, "Stock must be a positive number"),
  supplier: z.string().min(1, "Supplier is required"),
  warranty: z.string().optional(),
  points: z.coerce.number().optional(),
  features: z.array(z.object({ value: z.string() })).default([]),
  specifications: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ).default([]),
  images: z.array(z.string()).default([]),
  productAttributes: z
    .array(
      z.object({
        name: z.string().min(1, "Please select an attribute"),
        values: z.array(z.string()).min(1, "Please select at least one value"),
      })
    )
    .optional(),
  productType: z.enum(["Physical", "Digital"]).default("Physical"),
  downloadUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  digitalProductNote: z.string().optional(),
  createdAt: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSave: (data: Product) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const COMMON_WARRANTIES = [
  "No Warranty",
  "6 Months Brand Warranty",
  "1 Year Brand Warranty",
  "1 Year Official Replacement Warranty",
  "2 Years Brand Warranty",
  "Lifetime Limited Warranty",
];

export function ProductForm({ product, onSave, onCancel, isSaving }: ProductFormProps) {
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbBrands, setDbBrands] = useState<Brand[]>([]);
  const [dbSuppliers, setDbSuppliers] = useState<Supplier[]>([]);
  const [attributes, setAttributes] = useState<{ id: string; name: string; values: string[] }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("basic");

  // Fetch reference metadata
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [cats, brds, supps, attrs] = await Promise.all([
          fetch("/api/data/categories").then((r) => r.json()).catch(() => []),
          fetch("/api/data/brands").then((r) => r.json()).catch(() => []),
          fetch("/api/data/suppliers").then((r) => r.json()).catch(() => []),
          fetch("/api/data/attributes").then((r) => r.json()).catch(() => []),
        ]);
        if (!isMounted) return;
        setDbCategories(
          (Array.isArray(cats) ? cats : []).map((c: any) => ({
            id: c._id || c.id,
            name: c.name,
            description: c.description,
            permalink: c.permalink,
          }))
        );
        setDbBrands(
          (Array.isArray(brds) ? brds : []).map((b: any) => ({
            id: b._id || b.id,
            name: b.name,
            logo: b.logo,
            permalink: b.permalink,
          }))
        );
        setDbSuppliers(
          (Array.isArray(supps) ? supps : []).map((s: any) => ({
            id: s._id || s.id,
            name: s.name,
            contactPerson: s.contactPerson,
            email: s.email,
            permalink: s.permalink,
          }))
        );
        setAttributes(
          (Array.isArray(attrs) ? attrs : []).map((a: any) => ({
            id: a._id || a.id || a.name,
            name: a.name,
            values: a.values || [],
          }))
        );
      } catch (err) {
        console.error("Error loading product references:", err);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          ...product,
          categories: product.categories || [],
          permalink: product.permalink || "",
          productType: product.productType || "Physical",
          manageStock: product.manageStock ?? product.productType === "Physical",
          warranty: product.warranty || "",
          points: product.points || undefined,
          features: (product.features || []).map((f) => ({ value: f })),
          specifications: Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value })),
          productAttributes: product.productAttributes || [],
          downloadUrl: product.downloadUrl || "",
          digitalProductNote: product.digitalProductNote || "",
        }
      : {
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
          warranty: "1 Year Brand Warranty",
          points: undefined,
          features: [{ value: "" }],
          specifications: [{ key: "", value: "" }],
          images: [],
          productAttributes: [],
          productType: "Physical",
          downloadUrl: "",
          digitalProductNote: "",
        },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const { toast } = useToast();

  // Media state
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images || []);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [isUrlAdding, setIsUrlAdding] = useState(false);

  // Fetch from External URL state
  const [isFetchModalOpen, setIsFetchModalOpen] = useState(false);
  const [fetchUrl, setFetchUrl] = useState("");
  const [isFetchingAi, setIsFetchingAi] = useState(false);
  const [fetchStep, setFetchStep] = useState<"idle" | "fetching" | "extracting" | "populating">("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);

  // AI Write states
  const [isGeneratingAiDesc, setIsGeneratingAiDesc] = useState(false);
  const [isGeneratingAiFeatures, setIsGeneratingAiFeatures] = useState(false);

  // Auto slug & SKU generators
  const [isPermalinkLocked, setIsPermalinkLocked] = useState(true);
  const [isSkuLocked, setIsSkuLocked] = useState(true);
  const productName = watch("name");
  const brandName = watch("brand");
  const productPrice = watch("price");
  const originalPrice = watch("originalPrice");
  const productType = watch("productType");
  const manageStock = watch("manageStock");
  const stockQuantity = watch("stock");
  const selectedCategories = watch("categories") || [];

  // Auto-generate permalink when name changes (if locked)
  useEffect(() => {
    if (isPermalinkLocked && productName && !product?.id) {
      const generatedPermalink = productName
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("permalink", generatedPermalink, { shouldValidate: true });
    }
  }, [productName, isPermalinkLocked, setValue, product?.id]);

  // Auto-generate SKU when name and brand change (if locked)
  useEffect(() => {
    if (isSkuLocked && productName && brandName && !product?.id) {
      const brandPart = brandName.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "");
      const namePart = productName
        .split(" ")
        .slice(0, 3)
        .map((word) => word[0] || "")
        .join("")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

      if (brandPart && namePart) {
        setValue("sku", `${brandPart}-${namePart}`, { shouldValidate: true });
      }
    }
  }, [productName, brandName, isSkuLocked, setValue, product?.id]);

  // Dynamic discount calculation
  const discountInfo = useMemo(() => {
    if (originalPrice && originalPrice > productPrice && productPrice > 0) {
      const discountPercent = Math.round(((originalPrice - productPrice) / originalPrice) * 100);
      const savings = originalPrice - productPrice;
      return { discountPercent, savings };
    }
    return null;
  }, [productPrice, originalPrice]);

  // Field arrays
  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
    replace: replaceFeatures,
  } = useFieldArray({
    control,
    name: "features",
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
    replace: replaceSpecs,
  } = useFieldArray({
    control,
    name: "specifications",
  });

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control,
    name: "productAttributes",
  });

  // Handle image files selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFilesToUpload((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Remove an image preview
  const handleRemoveImage = (urlToRemove: string) => {
    if (urlToRemove.startsWith("blob:")) {
      const blobIndex = imagePreviews.filter((p) => p.startsWith("blob:")).indexOf(urlToRemove);
      setFilesToUpload((files) => files.filter((_, i) => i !== blobIndex));
    } else {
      setImagesToRemove((prev) => [...prev, urlToRemove]);
    }
    setImagePreviews((previews) => previews.filter((p) => p !== urlToRemove));
  };

  // Make an image the primary / cover image (move to index 0)
  const handleMakePrimary = (indexToPromote: number) => {
    if (indexToPromote === 0) return;
    setImagePreviews((prev) => {
      const updated = [...prev];
      const [promoted] = updated.splice(indexToPromote, 1);
      return [promoted, ...updated];
    });
  };

  // Add direct image URL
  const handleAddDirectUrl = () => {
    if (!newImageUrl.trim()) return;
    setImagePreviews((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    setIsUrlAdding(false);
  };

  // AI Generate Product Description
  const handleAiGenerateProductDescription = async () => {
    const name = watch("name")?.trim();
    if (!name) {
      toast({
        variant: "destructive",
        title: "Product Name Required",
        description: "Please enter a Product Name first so AI can write an accurate description.",
      });
      return;
    }

    setIsGeneratingAiDesc(true);
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product-description",
          context: {
            name,
            brand: watch("brand"),
            category: selectedCategories[0],
            supplier: watch("supplier"),
            warranty: watch("warranty"),
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setValue("description", data.text, { shouldValidate: true, shouldDirty: true });
        toast({
          title: "AI Description Written!",
          description: `Generated comprehensive product overview via ${data.provider}.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: data.message || "Could not generate description.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to contact AI service.",
      });
    } finally {
      setIsGeneratingAiDesc(false);
    }
  };

  // AI Generate Key Features & Highlights
  const handleAiGenerateFeatures = async () => {
    const name = watch("name")?.trim();
    if (!name) {
      toast({
        variant: "destructive",
        title: "Product Name Required",
        description: "Please enter a Product Name first so AI can extract standout features.",
      });
      return;
    }

    setIsGeneratingAiFeatures(true);
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product-features",
          context: {
            name,
            brand: watch("brand"),
            category: selectedCategories[0],
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        const lines = data.text
          .split("\n")
          .map((l: string) => l.replace(/^[-•*]\s*/, "").trim())
          .filter((l: string) => l.length > 0);

        if (lines.length > 0) {
          replaceFeatures(lines.map((l: string) => ({ value: l })));
        }
        toast({
          title: "AI Features Generated!",
          description: `Extracted ${lines.length} key highlight bullets via ${data.provider}.`,
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to generate features.",
      });
    } finally {
      setIsGeneratingAiFeatures(false);
    }
  };

  // Fetch product from external URL with Custom AI
  const handleFetchExternalProduct = async () => {
    const trimmed = fetchUrl.trim();
    if (!trimmed) {
      setFetchError("Please enter a valid product webpage URL.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setFetchError("URL must start with http:// or https://");
      return;
    }

    setIsFetchingAi(true);
    setFetchError(null);
    setFetchStep("fetching");

    try {
      setFetchStep("extracting");
      const res = await fetch("/api/admin/ai/fetch-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();
      if (!data.success) {
        setFetchError(data.message || "Failed to extract product details from this webpage.");
        setIsFetchingAi(false);
        return;
      }

      setFetchStep("populating");
      const p = data.product;

      // Populate basic info
      if (p.name) setValue("name", p.name, { shouldValidate: true, shouldDirty: true });
      if (p.description) setValue("description", p.description, { shouldValidate: true, shouldDirty: true });
      if (p.price !== undefined && p.price !== null) {
        setValue("price", Number(p.price) || 0, { shouldValidate: true, shouldDirty: true });
      }
      if (p.originalPrice !== undefined && p.originalPrice !== null) {
        setValue("originalPrice", Number(p.originalPrice) || undefined, { shouldValidate: true, shouldDirty: true });
      }
      if (p.brand) setValue("brand", p.brand, { shouldValidate: true, shouldDirty: true });
      if (p.sku) setValue("sku", p.sku, { shouldValidate: true, shouldDirty: true });
      if (p.stock !== undefined && p.stock !== null) {
        setValue("stock", Number(p.stock) || 10, { shouldValidate: true, shouldDirty: true });
      }
      if (p.supplier) setValue("supplier", p.supplier, { shouldValidate: true, shouldDirty: true });
      if (p.warranty) setValue("warranty", p.warranty, { shouldValidate: true, shouldDirty: true });

      // Match categories
      if (Array.isArray(p.categories) && p.categories.length > 0) {
        const matchedCats = p.categories.map((cat: string) => {
          const found = dbCategories.find(
            (c) => c.name.toLowerCase() === String(cat).toLowerCase()
          );
          return found ? found.name : String(cat);
        });
        setValue("categories", matchedCats, { shouldValidate: true, shouldDirty: true });
      }

      // Populate features
      if (Array.isArray(p.features) && p.features.length > 0) {
        replaceFeatures(p.features.map((f: string) => ({ value: String(f) })));
      }

      // Populate specifications
      if (Array.isArray(p.specifications) && p.specifications.length > 0) {
        replaceSpecs(
          p.specifications.map((s: any) => ({
            key: String(s.key || "").trim(),
            value: String(s.value || "").trim(),
          }))
        );
      }

      // Populate images
      if (Array.isArray(p.images) && p.images.length > 0) {
        const validImgs = p.images.map(String).filter((img: string) => /^https?:\/\//i.test(img));
        if (validImgs.length > 0) {
          setImagePreviews(validImgs);
          setValue("images", validImgs, { shouldValidate: true, shouldDirty: true });
        }
      }

      // Auto generate permalink
      if (p.name) {
        const generatedPermalink = p.name
          .toLowerCase()
          .trim()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
        setValue("permalink", generatedPermalink, { shouldValidate: true, shouldDirty: true });
      }

      toast({
        title: "Product Imported Successfully!",
        description: `Extracted all product details via ${data.provider || "Custom AI"}. All fields have been filled.`,
      });

      setIsFetchModalOpen(false);
      setFetchUrl("");
      setActiveTab("basic");
    } catch (err: any) {
      console.error("AI import failed:", err);
      setFetchError(err.message || "An unexpected error occurred during import.");
    } finally {
      setIsFetchingAi(false);
      setFetchStep("idle");
    }
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    // 1. Upload newly added file blobs to R2
    const uploadedImageUrls = await Promise.all(
      filesToUpload.map(async (file) => {
        const path = `products/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        await uploadFile(path, file, file.type);
        return getFileUrl(path);
      })
    );

    // 2. Delete removed images from R2 if applicable
    await Promise.all(
      imagesToRemove.map(async (url) => {
        try {
          if (!url.includes("/api/r2/proxy") && !url.includes(".r2.cloudflarestorage.com")) {
            return;
          }
          let key = url;
          if (url.includes("/api/r2/proxy")) {
            const urlObj = new URL(url, window.location.origin);
            key = urlObj.searchParams.get("key") || url;
          } else if (url.includes(".r2.cloudflarestorage.com")) {
            const urlObj = new URL(url);
            const parts = urlObj.pathname.split("/").filter(Boolean);
            if (urlObj.hostname.split(".").length <= 4) parts.shift();
            key = decodeURIComponent(parts.join("/"));
          }
          await deleteFile(key);
        } catch (error: any) {
          console.error("Error deleting image from storage:", error);
        }
      })
    );

    // 3. Combine existing URLs and freshly uploaded URLs
    const existingUrlsLeft = imagePreviews.filter((p) => !p.startsWith("blob:"));
    const finalImageUrls = [...existingUrlsLeft, ...uploadedImageUrls];

    // 4. Transform specifications to Record<string, string>
    const specObject: Record<string, string> = {};
    (data.specifications || []).forEach((spec) => {
      if (spec.key?.trim() && spec.value?.trim()) {
        specObject[spec.key.trim()] = spec.value.trim();
      }
    });

    // 5. Build clean product object
    const productPayload: Record<string, any> = {
      id: product?.id || "",
      name: data.name.trim(),
      permalink: data.permalink?.trim() || data.name.toLowerCase().replace(/\s+/g, "-"),
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice && data.originalPrice > 0 ? data.originalPrice : undefined,
      discountPercentage: discountInfo ? discountInfo.discountPercent : undefined,
      categories: data.categories,
      brand: data.brand,
      sku: data.sku.trim(),
      manageStock: data.manageStock,
      stock: data.manageStock ? data.stock : 9999,
      supplier: data.supplier,
      warranty: data.warranty?.trim() || undefined,
      points: data.points && data.points > 0 ? data.points : undefined,
      productType: data.productType,
      downloadUrl: data.productType === "Digital" ? data.downloadUrl?.trim() : undefined,
      digitalProductNote: data.productType === "Digital" ? data.digitalProductNote?.trim() : undefined,
      productAttributes: data.productAttributes && data.productAttributes.length > 0 ? data.productAttributes : [],
      features: (data.features || []).map((f) => f.value?.trim()).filter(Boolean),
      specifications: specObject,
      images: finalImageUrls.length > 0 ? finalImageUrls : ["https://placehold.co/600x600.png"],
      rating: product?.rating || 0,
      reviewCount: product?.reviewCount || 0,
      createdAt: product?.createdAt || new Date().toISOString(),
    };

    // Remove undefined properties
    Object.keys(productPayload).forEach((key) => {
      if (productPayload[key] === undefined) {
        delete productPayload[key];
      }
    });

    await onSave(productPayload as Product);
  };

  const onInvalid = (formErrors: any) => {
    console.warn("Product form validation errors:", formErrors);
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length === 0) return;

    const firstKey = errorKeys[0];
    const firstError = formErrors[firstKey];
    const errorMessage = firstError?.message || `${firstKey} is invalid or required.`;

    toast({
      variant: "destructive",
      title: "Required Fields Missing",
      description: errorMessage,
    });

    // Switch to the relevant tab automatically
    if (["name", "description", "brand", "supplier", "categories", "sku", "permalink"].includes(firstKey)) {
      setActiveTab("basic");
    } else if (["price", "originalPrice", "stock", "manageStock"].includes(firstKey)) {
      setActiveTab("pricing");
    } else if (["images"].includes(firstKey)) {
      setActiveTab("media");
    } else if (["features", "specifications", "warranty", "points"].includes(firstKey)) {
      setActiveTab("specs");
    } else if (["productAttributes", "downloadUrl", "digitalProductNote", "productType"].includes(firstKey)) {
      setActiveTab("variants");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Navigation Tabs Bar & Quick AI Import Action */}
        <div className="px-6 pt-3 pb-2 border-b bg-muted/30 shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-w-0">
            <TabsList className="grid grid-cols-5 w-full h-auto p-1 bg-muted/80 rounded-xl gap-1">
              <TabsTrigger
                value="basic"
                className="py-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Package className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="py-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <DollarSign className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Price & Stock</span>
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="py-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Media ({imagePreviews.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="py-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Specs & Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="variants"
                className="py-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Boxes className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Variants</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFetchError(null);
              setIsFetchModalOpen(true);
            }}
            className="h-9 px-3 gap-1.5 text-xs font-semibold shrink-0 border-blue-600/40 text-blue-600 bg-blue-50/70 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:border-blue-500/50 dark:text-blue-400 dark:hover:bg-blue-900/60 shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Fetch from external url</span>
          </Button>
        </div>

        {/* Scrollable Form Body with Visible Vertical Scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 overscroll-contain modal-scrollbar">
          {/* TAB 1: General Info */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              {/* Product Type Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Boxes className="h-4 w-4 text-primary" /> Product Type <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setValue("productType", "Physical");
                      setValue("manageStock", true);
                    }}
                    className={cn(
                      "flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200",
                      productType === "Physical"
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border hover:border-primary/50 bg-card hover:bg-muted/30"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center",
                        productType === "Physical" ? "border-primary bg-primary text-white" : "border-muted-foreground"
                      )}
                    >
                      {productType === "Physical" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Physical Product</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Shippable tangible goods tracked via warehouse inventory.
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setValue("productType", "Digital");
                      setValue("manageStock", false);
                    }}
                    className={cn(
                      "flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200",
                      productType === "Digital"
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border hover:border-primary/50 bg-card hover:bg-muted/30"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center",
                        productType === "Digital" ? "border-primary bg-primary text-white" : "border-muted-foreground"
                      )}
                    >
                      {productType === "Digital" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Digital Product / License</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Downloadable files, software keys, or digital service links.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title, Slug & SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-1.5">
                    Product Title / Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g. Haylou Solar Plus RT3 Smartwatch"
                    className="text-base font-medium h-11"
                  />
                  {errors.name && <p className="text-destructive text-xs font-medium">{errors.name.message}</p>}
                </div>

                {/* Permalink */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="permalink" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Link2 className="h-3.5 w-3.5" /> URL Slug / Permalink
                    </Label>
                    <button
                      type="button"
                      onClick={() => setIsPermalinkLocked(!isPermalinkLocked)}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      {isPermalinkLocked ? "Customize Slug" : "Auto-Generate"}
                    </button>
                  </div>
                  <div className="flex items-center rounded-md border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                    <span className="truncate">/products/{watch("permalink") || "your-product-slug"}</span>
                  </div>
                  {!isPermalinkLocked && (
                    <Input
                      id="permalink"
                      {...register("permalink")}
                      placeholder="custom-slug"
                      className="h-8 text-xs font-mono"
                    />
                  )}
                  {errors.permalink && <p className="text-destructive text-xs">{errors.permalink.message}</p>}
                </div>

                {/* SKU */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sku" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" /> Stock Keeping Unit (SKU) <span className="text-destructive">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => setIsSkuLocked(!isSkuLocked)}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      {isSkuLocked ? "Manual SKU" : "Auto SKU"}
                    </button>
                  </div>
                  <Input
                    id="sku"
                    {...register("sku")}
                    placeholder="e.g. HAY-SOL-RT3"
                    className="h-8 text-xs font-mono uppercase font-semibold"
                  />
                  {errors.sku && <p className="text-destructive text-xs">{errors.sku.message}</p>}
                </div>
              </div>

              {/* Brand, Categories, Supplier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Brand */}
                <FormField
                  control={control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">
                        Brand <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select Brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dbBrands.map((b) => (
                            <SelectItem key={b.id} value={b.name} className="cursor-pointer">
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Supplier */}
                <FormField
                  control={control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">
                        Supplier / Vendor <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select Supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dbSuppliers.map((s) => (
                            <SelectItem key={s.id} value={s.name} className="cursor-pointer">
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Categories Popover with Badges */}
                <FormField
                  control={control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-semibold">
                        Categories <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between h-10 font-normal px-3"
                            >
                              <span className="truncate">
                                {field.value?.length > 0 ? `${field.value.length} categories chosen` : "Choose Categories"}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search categories..." />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                {dbCategories.map((category) => {
                                  const isChecked = (field.value || []).includes(category.name);
                                  return (
                                    <CommandItem
                                      key={category.id}
                                      onSelect={() => {
                                        const current = field.value || [];
                                        const updated = isChecked
                                          ? current.filter((c) => c !== category.name)
                                          : [...current, category.name];
                                        field.onChange(updated);
                                      }}
                                      className="cursor-pointer flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Checkbox checked={isChecked} />
                                        <span>{category.name}</span>
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Selected Categories Chips */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-muted/40 border">
                  <span className="text-xs font-medium text-muted-foreground mr-1">Selected:</span>
                  {selectedCategories.map((catName) => (
                    <Badge
                      key={catName}
                      variant="secondary"
                      className="gap-1 pl-2.5 pr-1.5 py-0.5 text-xs font-medium bg-background border"
                    >
                      {catName}
                      <button
                        type="button"
                        onClick={() => {
                          setValue(
                            "categories",
                            selectedCategories.filter((c) => c !== catName),
                            { shouldValidate: true }
                          );
                        }}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" /> Product Description <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAiGenerateProductDescription}
                    disabled={isGeneratingAiDesc || isSaving}
                    className="h-7 px-2.5 text-xs font-semibold text-purple-700 bg-purple-50/80 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 border-purple-200 shadow-2xs gap-1.5 cursor-pointer"
                  >
                    {isGeneratingAiDesc ? (
                      <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    )}
                    <span>{isGeneratingAiDesc ? "Writing..." : "AI Write Description"}</span>
                  </Button>
                </div>
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          id="description"
                          rows={6}
                          placeholder="Provide a comprehensive product overview, features, specifications, and details..."
                          className="font-normal text-sm leading-relaxed"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-muted-foreground">HTML tags and formatting supported.</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-muted-foreground font-mono">{field.value?.length || 0} characters</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleAiGenerateProductDescription}
                            disabled={isGeneratingAiDesc || isSaving}
                            className="h-7 px-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 border-purple-300 shadow-2xs gap-1.5 cursor-pointer"
                          >
                            {isGeneratingAiDesc ? (
                              <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                            ) : (
                              <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            )}
                            <span>{isGeneratingAiDesc ? "Generating..." : "AI Generate"}</span>
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Pricing & Inventory */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              {/* Pricing Grid */}
              <div className="p-4 rounded-xl border bg-card space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <DollarSign className="h-4 w-4 text-primary" /> Product Pricing (BDT ৳)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selling Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs font-semibold flex items-center gap-1">
                      Regular / Selling Price (৳) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                        ৳
                      </span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register("price")}
                        className="pl-8 text-lg font-bold text-primary h-11"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && <p className="text-destructive text-xs font-medium">{errors.price.message}</p>}
                  </div>

                  {/* Original / Compare at price */}
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      Original / Strike-through Price (৳)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                        ৳
                      </span>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        {...register("originalPrice")}
                        className="pl-8 text-base font-medium h-11"
                        placeholder="Optional compare price"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Discount Pill */}
                {discountInfo && (
                  <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white font-bold text-xs px-2">
                        {discountInfo.discountPercent}% OFF
                      </Badge>
                      <span className="text-blue-900 dark:text-blue-300 font-medium">
                        Customer saves ৳{discountInfo.savings.toFixed(2)} on this product.
                      </span>
                    </div>
                    <span className="text-muted-foreground">Automatic discount badge will display on storefront.</span>
                  </div>
                )}
              </div>

              {/* Inventory Management Card */}
              <div className="p-4 rounded-xl border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" /> Track Stock & Inventory
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable to monitor available units and prevent overselling.
                    </p>
                  </div>
                  <FormField
                    control={control}
                    name="manageStock"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={productType === "Digital"}
                      />
                    )}
                  />
                </div>

                {manageStock && (
                  <div className="pt-2 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-xs font-semibold">
                        Available Stock Quantity <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        {...register("stock")}
                        placeholder="e.g. 50"
                        className="h-10 font-bold"
                      />
                      {errors.stock && <p className="text-destructive text-xs font-medium">{errors.stock.message}</p>}
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/40 text-xs space-y-1">
                      <span className="font-semibold text-muted-foreground">Live Stock Status:</span>
                      <div>
                        {stockQuantity > 10 ? (
                          <Badge variant="outline" className="border-emerald-600 text-emerald-600 bg-emerald-50/50">
                            In Stock ({stockQuantity} Units)
                          </Badge>
                        ) : stockQuantity > 0 ? (
                          <Badge variant="outline" className="border-amber-600 text-amber-600 bg-amber-50/50">
                            Low Stock Warning ({stockQuantity} Units Remaining)
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Out of Stock (0 Units)</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Warranty and Club Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Warranty */}
                <div className="space-y-2">
                  <Label htmlFor="warranty" className="text-xs font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Warranty Period
                  </Label>
                  <Input
                    id="warranty"
                    {...register("warranty")}
                    placeholder="e.g. 1 Year Brand Warranty"
                    className="h-10"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {COMMON_WARRANTIES.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setValue("warranty", preset, { shouldDirty: true })}
                        className="text-[10px] px-2 py-0.5 rounded border bg-muted/50 hover:bg-muted text-foreground/80 hover:text-foreground transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Club Points */}
                <div className="space-y-2">
                  <Label htmlFor="points" className="text-xs font-semibold flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-amber-500" /> Club Reward Points
                  </Label>
                  <Input
                    id="points"
                    type="number"
                    {...register("points")}
                    placeholder="e.g. 50"
                    className="h-10"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Points awarded to the customer upon order completion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Media & Images */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Upload Dropzone */}
              <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-center relative cursor-pointer">
                <input
                  id="image-dropzone"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSaving}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="font-semibold text-sm">Click or Drag & Drop Product Images Here</div>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Supports high-resolution WebP, PNG, JPG, or AVIF. Stored securely on Cloudflare R2.
                  </p>
                </div>
              </div>

              {/* Direct URL Adder */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <ExternalLink className="h-4 w-4 text-primary" /> Add Image by Direct URL:
                </div>
                {isUrlAdding ? (
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <Input
                      placeholder="https://... or /api/r2/proxy?key=..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                    <Button type="button" size="sm" onClick={handleAddDirectUrl} className="h-8 text-xs">
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsUrlAdding(false)}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUrlAdding(true)}
                    className="h-8 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Image Link
                  </Button>
                )}
              </div>

              {/* Image Previews Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-primary" /> Gallery ({imagePreviews.length} images)
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    First image is used as primary product card thumbnail.
                  </span>
                </div>

                {imagePreviews.length === 0 ? (
                  <div className="p-8 text-center border rounded-xl bg-muted/20 text-muted-foreground text-sm">
                    No images added yet. Upload files or paste an image URL above.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((src, index) => {
                      const isPrimary = index === 0;
                      return (
                        <div
                          key={index}
                          className={cn(
                            "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 bg-secondary/30",
                            isPrimary ? "border-primary shadow-sm ring-2 ring-primary/20" : "border-border"
                          )}
                        >
                          <Image
                            src={src}
                            alt={`Product preview ${index + 1}`}
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />

                          {/* Primary Badge */}
                          {isPrimary && (
                            <Badge className="absolute top-2 left-2 bg-primary text-white text-[10px] px-1.5 py-0.5 font-bold shadow-xs flex items-center gap-1">
                              <Star className="h-3 w-3 fill-white" /> Cover
                            </Badge>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-2">
                            <div className="w-full flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(src)}
                                className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                                title="Remove image"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleMakePrimary(index)}
                                className="text-[10px] font-semibold bg-white text-black px-2 py-1 rounded-md shadow-xs hover:bg-primary hover:text-white transition-colors"
                              >
                                Set as Cover
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Specifications & Highlights */}
          {activeTab === "specs" && (
            <div className="space-y-6">
              {/* Bullet Highlights / Features */}
              <div className="p-4 rounded-xl border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary" /> Key Features & Highlights
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Short bullet points displayed next to the product price on product details page.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAiGenerateFeatures}
                      disabled={isGeneratingAiFeatures || isSaving}
                      className="h-8 px-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 border-purple-200 cursor-pointer shadow-2xs gap-1.5"
                    >
                      {isGeneratingAiFeatures ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      )}
                      <span>{isGeneratingAiFeatures ? "Extracting..." : "AI Generate Features"}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendFeature({ value: "" })}
                      className="h-8 text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Feature
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {featureFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-muted-foreground w-6 text-center">
                        #{index + 1}
                      </span>
                      <Input
                        {...register(`features.${index}.value`)}
                        placeholder="e.g. 1.43'' AMOLED Display with Always-On Display"
                        className="h-9 text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 rounded-xl border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-primary" /> Technical Specifications
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Full specifications table displayed under the "Specification" tab on the product page.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendSpec({ key: "", value: "" })}
                    className="h-8 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Specification
                  </Button>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-1 pb-1 border-b">
                    <div className="col-span-5">Specification Key</div>
                    <div className="col-span-6">Value / Detail</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>

                  {specFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          {...register(`specifications.${index}.key`)}
                          placeholder="e.g. Battery Capacity"
                          className="h-9 text-xs sm:text-sm font-medium"
                        />
                      </div>
                      <div className="col-span-6">
                        <Input
                          {...register(`specifications.${index}.value`)}
                          placeholder="e.g. 410mAh Pure Cobalt, 7-day battery life"
                          className="h-9 text-xs sm:text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSpec(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Variants & Attributes */}
          {activeTab === "variants" && (
            <div className="space-y-6">
              {/* Product Attributes (Color, Size, etc.) */}
              <div className="p-4 rounded-xl border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary" /> Product Attributes (Variants)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configure selectable variant options such as Color, Strap Size, or Storage.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAttribute({ name: "", values: [] })}
                    className="h-8 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Option
                  </Button>
                </div>

                {attributeFields.length === 0 ? (
                  <div className="p-6 text-center border rounded-lg bg-muted/20 text-muted-foreground text-xs">
                    No custom variants configured. Click "Add Option" to attach Colors, Sizes, or Models.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attributeFields.map((field, index) => {
                      const attributeName = watch(`productAttributes.${index}.name`);
                      const availableValues = attributes.find((a) => a.name === attributeName)?.values || [];
                      const selectedValues = watch(`productAttributes.${index}.values`) || [];

                      return (
                        <div key={field.id} className="p-4 rounded-lg border bg-secondary/20 space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 max-w-xs">
                              <FormField
                                control={control}
                                name={`productAttributes.${index}.name`}
                                render={({ field: selectField }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-semibold">Attribute Type</FormLabel>
                                    <Select
                                      onValueChange={(val) => {
                                        selectField.onChange(val);
                                        setValue(`productAttributes.${index}.values`, []);
                                      }}
                                      value={selectField.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-9">
                                          <SelectValue placeholder="Select attribute (Color, Size...)" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {attributes.map((attr) => (
                                          <SelectItem key={attr.id} value={attr.name}>
                                            {attr.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAttribute(index)}
                              className="text-muted-foreground hover:text-destructive h-8 w-8 mt-5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {attributeName && (
                            <div className="space-y-2 pt-2 border-t">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Select Available Values for {attributeName}:
                              </Label>
                              <div className="flex flex-wrap gap-2">
                                {availableValues.map((value) => {
                                  const isSelected = selectedValues.includes(value);
                                  return (
                                    <Button
                                      type="button"
                                      key={value}
                                      variant={isSelected ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => {
                                        const newValues = isSelected
                                          ? selectedValues.filter((v: string) => v !== value)
                                          : [...selectedValues, value];
                                        setValue(`productAttributes.${index}.values`, newValues, {
                                          shouldValidate: true,
                                        });
                                      }}
                                      className={cn(
                                        "h-8 text-xs font-medium",
                                        isSelected
                                          ? "bg-primary text-primary-foreground font-semibold"
                                          : "hover:bg-primary/10"
                                      )}
                                    >
                                      {isSelected && <Check className="h-3 w-3 mr-1" />}
                                      {value}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Digital Product Delivery (Conditional) */}
              {productType === "Digital" && (
                <div className="p-4 rounded-xl border-2 border-dashed border-blue-400/50 bg-blue-50/20 dark:bg-blue-950/20 space-y-4">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-sm">Digital Asset Delivery</h4>
                      <p className="text-xs text-muted-foreground">
                        Configure customer download URL and instructions delivered on successful payment.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="downloadUrl" className="text-xs font-semibold">
                        Secure Download File URL
                      </Label>
                      <Input
                        id="downloadUrl"
                        {...register("downloadUrl")}
                        placeholder="https://example.com/software-download-v1.zip"
                        className="font-mono text-xs"
                      />
                      {errors.downloadUrl && (
                        <p className="text-destructive text-xs">{errors.downloadUrl.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="digitalProductNote" className="text-xs font-semibold">
                        Delivery Note / License Instructions
                      </Label>
                      <Textarea
                        id="digitalProductNote"
                        rows={3}
                        {...register("digitalProductNote")}
                        placeholder="e.g. Your license activation key and link will expire in 48 hours."
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="px-6 py-3.5 border-t bg-card/95 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {product?.id ? (
              <span className="flex items-center gap-1 font-mono">
                <Tag className="h-3.5 w-3.5" /> ID: {product.id}
              </span>
            ) : (
              <span className="font-medium text-foreground/80">Ready to publish new product to catalog</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving} className="h-10 px-4 cursor-pointer">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 px-6 font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {product?.id ? "Update Product" : "Publish Product"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Fetch from External URL Modal */}
      <Dialog open={isFetchModalOpen} onOpenChange={setIsFetchModalOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl p-6">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Fetch Product from External URL</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Import product details, pricing, specifications, features, and images with Custom AI.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="external-url-input" className="text-xs font-semibold flex items-center justify-between">
                <span>Product Webpage URL</span>
                <span className="text-[11px] text-muted-foreground font-normal">HTTP or HTTPS</span>
              </Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="external-url-input"
                    type="url"
                    value={fetchUrl}
                    onChange={(e) => {
                      setFetchUrl(e.target.value);
                      if (fetchError) setFetchError(null);
                    }}
                    placeholder="https://www.example.com/product-page"
                    className="pl-9 text-xs"
                    disabled={isFetchingAi}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFetchExternalProduct();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text && /^https?:\/\//i.test(text.trim())) {
                        setFetchUrl(text.trim());
                        setFetchError(null);
                      }
                    } catch {}
                  }}
                  disabled={isFetchingAi}
                  className="h-9 px-3 text-xs shrink-0 cursor-pointer"
                >
                  <ClipboardCopy className="h-3.5 w-3.5 mr-1" /> Paste
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Paste any product link (e.g. Amazon, AliExpress, Daraz, Apple, Samsung, StarTech, or any store).
              </p>
            </div>

            {/* Popular supported stores chips */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground">Supported across any eCommerce site:</p>
              <div className="flex flex-wrap gap-1.5">
                {["Amazon", "AliExpress", "Daraz", "Apple Store", "Samsung", "StarTech", "Gadget & Gear", "Shopify Stores"].map((store) => (
                  <Badge key={store} variant="secondary" className="text-[10px] py-0.5 px-2 font-normal">
                    {store}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Step / Progress Indicator */}
            {isFetchingAi && (
              <div className="rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3 animate-in fade-in-50">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      {fetchStep === "fetching" && "Step 1/3: Downloading external webpage..."}
                      {fetchStep === "extracting" && "Step 2/3: Analyzing & extracting data with Custom AI..."}
                      {fetchStep === "populating" && "Step 3/3: Mapping specifications and gallery..."}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Extracting product title, pricing, specifications, features, and imagery.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {fetchError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <p className="font-semibold">Import Failed</p>
                  <p className="text-[11px] opacity-90">{fetchError}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFetchModalOpen(false);
                setFetchError(null);
              }}
              disabled={isFetchingAi}
              className="w-full sm:w-auto text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleFetchExternalProduct}
              disabled={isFetchingAi || !fetchUrl.trim()}
              className="w-full sm:w-auto text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs cursor-pointer"
            >
              {isFetchingAi ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Fetching with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Fetch & Fill Form
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
