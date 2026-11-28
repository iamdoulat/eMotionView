"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  Award,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Search,
  Link2,
  ExternalLink,
  Check,
  Upload,
  Globe,
  Tag,
  Eye,
  Lock,
  Unlock,
  X,
  Building2,
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc, docToJSON } from "@/lib/db";
import { db } from "@/lib/db";
import { uploadFile, getFileUrl } from "@/lib/r2";
import { cn } from "@/lib/utils";

const brandSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Brand name is required"),
  permalink: z.string().min(1, "Permalink is required"),
  logo: z.string().optional(),
  banner: z.string().optional(),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  description: z.string().optional(),
  isFeatured: z.boolean().default(false),
  order: z.coerce.number().default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [isPermalinkManuallyEdited, setIsPermalinkManuallyEdited] = useState(false);

  // File upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      isFeatured: false,
      order: 0,
    },
  });

  const brandName = watch("name");
  const currentPermalink = watch("permalink");
  const currentDescription = watch("description");
  const isFeaturedValue = watch("isFeatured");

  // Auto-generate permalink when brand name changes
  useEffect(() => {
    if (!isPermalinkManuallyEdited && brandName) {
      const generatedPermalink = brandName
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("permalink", generatedPermalink, { shouldValidate: true });
    }
  }, [brandName, isPermalinkManuallyEdited, setValue]);

  // Fetch brands from DB
  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const brandsSnapshot = await getDocs(collection(db, "brands"));
        const brandList = brandsSnapshot.docs.map((doc) => docToJSON(doc) as Brand);
        setBrands(brandList);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load brand data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrands();
  }, [toast]);

  const handleOpenForm = (brand?: Brand) => {
    setActiveTab("general");
    setLogoFile(null);
    setBannerFile(null);

    if (brand) {
      setBrandToEdit(brand);
      reset({
        id: brand.id,
        name: brand.name || "",
        permalink: brand.permalink || "",
        logo: brand.logo || "",
        banner: brand.banner || "",
        website: brand.website || "",
        description: brand.description || "",
        isFeatured: brand.isFeatured || false,
        order: brand.order || 0,
        metaTitle: brand.metaTitle || "",
        metaDescription: brand.metaDescription || "",
        metaKeywords: brand.metaKeywords || "",
      });
      setLogoPreview(brand.logo || "");
      setBannerPreview(brand.banner || "");
      setIsPermalinkManuallyEdited(true);
    } else {
      setBrandToEdit(null);
      reset({
        name: "",
        permalink: "",
        logo: "",
        banner: "",
        website: "",
        description: "",
        isFeatured: false,
        order: 0,
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
      });
      setLogoPreview("");
      setBannerPreview("");
      setIsPermalinkManuallyEdited(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setBrandToEdit(null);
    setIsFormOpen(false);
    setLogoFile(null);
    setBannerFile(null);
    setLogoPreview("");
    setBannerPreview("");
  };

  // Logo file upload handler
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  // Banner file upload handler
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const handleSaveBrand: SubmitHandler<BrandFormData> = async (data) => {
    setIsSubmitting(true);
    setIsUploadingMedia(true);
    try {
      let finalLogoUrl = data.logo || "https://placehold.co/120x50.png";
      let finalBannerUrl = data.banner || "";

      // 1. Upload logo to R2 if a file is selected
      if (logoFile) {
        const path = `brands/logos/${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        await uploadFile(path, logoFile, logoFile.type);
        finalLogoUrl = await getFileUrl(path);
      }

      // 2. Upload banner to R2 if selected
      if (bannerFile) {
        const path = `brands/banners/${Date.now()}-${bannerFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        await uploadFile(path, bannerFile, bannerFile.type);
        finalBannerUrl = await getFileUrl(path);
      }

      const brandPayload = {
        name: data.name.trim(),
        permalink: data.permalink.trim(),
        logo: finalLogoUrl,
        banner: finalBannerUrl,
        website: data.website?.trim() || "",
        description: data.description?.trim() || "",
        isFeatured: Boolean(data.isFeatured),
        order: Number(data.order) || 0,
        metaTitle: data.metaTitle?.trim() || "",
        metaDescription: data.metaDescription?.trim() || "",
        metaKeywords: data.metaKeywords?.trim() || "",
      };

      if (brandToEdit) {
        // Update existing brand
        const docRef = doc(db, "brands", brandToEdit.id);
        await setDoc(docRef, brandPayload, { merge: true });
        setBrands(
          brands.map((b) => (b.id === brandToEdit.id ? { ...brandPayload, id: brandToEdit.id } : b))
        );
        toast({ title: "Success", description: "Brand updated successfully." });
      } else {
        // Create new brand
        const docRef = await addDoc(collection(db, "brands"), brandPayload);
        setBrands([...brands, { ...brandPayload, id: docRef.id }]);
        toast({ title: "Success", description: "New brand created successfully." });
      }
      handleCloseForm();
    } catch (error) {
      console.error("Error saving brand:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save the brand. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploadingMedia(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;
    try {
      await deleteDoc(doc(db, "brands", brandToDelete.id));
      setBrands(brands.filter((b) => b.id !== brandToDelete.id));
      toast({ title: "Success", description: "Brand deleted successfully." });
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete brand." });
    } finally {
      setBrandToDelete(null);
    }
  };

  // Filtered brands
  const filteredBrands = brands.filter((brand) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (brand.name && brand.name.toLowerCase().includes(q)) ||
      (brand.permalink && brand.permalink.toLowerCase().includes(q)) ||
      (brand.description && brand.description.toLowerCase().includes(q)) ||
      (brand.website && brand.website.toLowerCase().includes(q))
    );
  });

  const featuredCount = brands.filter((b) => b.isFeatured).length;

  return (
    <div className="space-y-6">
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Award className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl">Product Brands</CardTitle>
              </div>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                Manage manufacturers, official brand logos, storefront landing pages, and website links.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                <span>Total:</span>
                <strong className="text-foreground">{brands.length}</strong>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
                <span>Featured:</span>
                <strong>{featuredCount}</strong>
              </div>
              <Button onClick={() => handleOpenForm()} className="shadow-xs font-semibold">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="pt-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands by name, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs sm:text-sm"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[280px]">Brand</TableHead>
                  <TableHead>Permalink / URL</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-center w-[100px]">Order</TableHead>
                  <TableHead className="text-center w-[140px]">Status</TableHead>
                  <TableHead className="text-right w-[80px]">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Loading brands...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => (
                    <TableRow key={brand.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-20 rounded-lg border bg-card p-1.5 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                            {brand.logo ? (
                              <Image
                                src={brand.logo}
                                alt={brand.name}
                                width={72}
                                height={32}
                                className="max-h-full max-w-full object-contain"
                                unoptimized
                              />
                            ) : (
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-foreground truncate flex items-center gap-1.5">
                              <span>{brand.name}</span>
                              {brand.isFeatured && (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            {brand.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                {brand.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/brand/${brand.permalink}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <span>/brand/{brand.permalink}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </TableCell>

                      <TableCell>
                        {brand.website ? (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-[200px]"
                          >
                            <Globe className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">{brand.website.replace(/^https?:\/\//, "")}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs">
                        {brand.order ?? 0}
                      </TableCell>

                      <TableCell className="text-center">
                        {brand.isFeatured ? (
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Standard
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs">Brand Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/brand/${brand.permalink}`} target="_blank" className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Page
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenForm(brand)} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4 text-amber-500" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() => setBrandToDelete(brand)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-xs">
                      {searchQuery
                        ? `No brands matching "${searchQuery}".`
                        : "No brands found. Click 'Add Brand' to create your first manufacturer."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredBrands.length}</strong> of <strong>{brands.length}</strong> brands.
          </div>
        </CardFooter>
      </Card>

      {/* Modernized Add / Edit Brand Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl w-[95vw] h-[85vh] max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card gap-0">
          {/* Sticky Dialog Header */}
          <DialogHeader className="px-6 py-4 border-b bg-card shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shadow-xs shrink-0",
                    brandToEdit
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {brandToEdit ? <Edit className="h-5 w-5" /> : <Award className="h-5 w-5" />}
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">
                    {brandToEdit ? `Edit Brand: ${brandToEdit.name}` : "Add New Brand"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {brandToEdit
                      ? "Update brand details, official logo, hero banner, and SEO."
                      : "Register a brand, set URL slug, and upload high-res official logo."}
                  </DialogDescription>
                </div>
              </div>

              {brandToEdit && (
                <div className="flex items-center gap-1.5 flex-wrap sm:mr-8">
                  {brandToEdit.permalink && (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      /{brandToEdit.permalink}
                    </Badge>
                  )}
                  {brandToEdit.isFeatured && (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                      Featured
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Form with Flex Layout and Visible Vertical Scroll */}
          <form
            onSubmit={handleSubmit(handleSaveBrand)}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {/* Pinned Tab Switcher */}
            <div className="px-6 pt-3 pb-2 border-b bg-muted/20 shrink-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 h-auto p-1 bg-muted/60 rounded-xl gap-1">
                  <TabsTrigger
                    value="general"
                    className="py-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>General Info</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="py-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon className="h-4 w-4 shrink-0" />
                    <span>Logo & Media</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="seo"
                    className="py-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>Display & SEO</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Scrollable Form Body with Visible Custom Scrollbar */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 overscroll-contain modal-scrollbar space-y-6">
              {/* TAB 1: General Info */}
              {activeTab === "general" && (
                <div className="space-y-5">
                  {/* Brand Name */}
                  <div className="space-y-2">
                    <Label htmlFor="brand-name" className="text-sm font-semibold flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-primary" /> Brand Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="brand-name"
                      {...register("name")}
                      placeholder="e.g. Haylou, Soundpeats, Xiaomi"
                      disabled={isSubmitting}
                      className="h-10 text-sm font-medium"
                      autoFocus
                    />
                    {errors.name && <p className="text-destructive text-xs font-medium">{errors.name.message}</p>}
                  </div>

                  {/* Permalink / Slug with lock button and live URL preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="brand-permalink" className="text-sm font-semibold flex items-center gap-1.5">
                        <Link2 className="h-4 w-4 text-primary" /> Permalink / URL Slug <span className="text-destructive">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPermalinkManuallyEdited(!isPermalinkManuallyEdited)}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                      >
                        {isPermalinkManuallyEdited ? (
                          <>
                            <Lock className="h-3.5 w-3.5 text-amber-500" />
                            <span>Auto Generate</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3.5 w-3.5" />
                            <span>Customize Slug</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex rounded-md shadow-xs">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs font-mono select-none">
                        /brand/
                      </span>
                      <Input
                        id="brand-permalink"
                        {...register("permalink")}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          setIsPermalinkManuallyEdited(true);
                          setValue("permalink", e.target.value, { shouldValidate: true });
                        }}
                        placeholder="haylou"
                        className="rounded-l-none font-mono text-xs"
                      />
                    </div>
                    {errors.permalink && (
                      <p className="text-destructive text-xs font-medium">{errors.permalink.message}</p>
                    )}

                    {/* Live URL Pill */}
                    {currentPermalink && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate font-mono">
                          Storefront URL: <strong>/brand/{currentPermalink}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Official Website */}
                  <div className="space-y-2">
                    <Label htmlFor="brand-website" className="text-sm font-semibold flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-primary" /> Official Website (Optional)
                    </Label>
                    <Input
                      id="brand-website"
                      {...register("website")}
                      placeholder="https://haylou.info"
                      disabled={isSubmitting}
                      className="h-10 text-xs sm:text-sm font-mono"
                    />
                    {errors.website && (
                      <p className="text-destructive text-xs font-medium">{errors.website.message}</p>
                    )}
                  </div>

                  {/* Description / Story */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="brand-description" className="text-sm font-semibold">
                        Brand Story / About
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {(currentDescription || "").length} characters
                      </span>
                    </div>
                    <Textarea
                      id="brand-description"
                      {...register("description")}
                      rows={4}
                      disabled={isSubmitting}
                      placeholder="Official brand background, quality certifications, or warranty commitments..."
                      className="text-xs sm:text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Logo & Media */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  {/* Brand Official Logo */}
                  <div className="p-4 rounded-xl border bg-card space-y-4">
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-primary" /> Official Brand Logo
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Displayed in product cards, brand filters, and brand landing pages (recommended: Transparent PNG or SVG, max 300×120px).
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border bg-secondary/20">
                      {/* Logo Preview Card */}
                      <div className="text-center shrink-0">
                        <div className="w-40 h-24 rounded-xl border-2 border-primary/30 bg-card p-3 flex items-center justify-center overflow-hidden shadow-xs relative">
                          {logoPreview ? (
                            <Image
                              src={logoPreview}
                              alt="Brand Logo Preview"
                              width={140}
                              height={80}
                              className="max-h-full max-w-full object-contain"
                              unoptimized
                            />
                          ) : (
                            <Building2 className="h-10 w-10 text-muted-foreground/40" />
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground mt-2 block">
                          Storefront Preview
                        </span>
                      </div>

                      {/* Upload / URL controls */}
                      <div className="flex-1 w-full space-y-3">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => logoInputRef.current?.click()}
                            className="gap-1.5"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload to Cloudflare R2</span>
                          </Button>

                          {logoPreview && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview("");
                                setValue("logo", "");
                              }}
                              className="text-destructive hover:text-destructive gap-1 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </Button>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="brand-logo-url" className="text-xs text-muted-foreground">
                            Or direct Image URL
                          </Label>
                          <Input
                            id="brand-logo-url"
                            {...register("logo")}
                            value={watch("logo") || ""}
                            onChange={(e) => {
                              setValue("logo", e.target.value);
                              setLogoPreview(e.target.value);
                            }}
                            placeholder="https://example.com/logo.png or /api/r2/proxy?key=..."
                            className="font-mono text-xs h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Brand Hero Banner */}
                  <div className="p-4 rounded-xl border bg-card space-y-4">
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-primary" /> Brand Hero Banner (Optional)
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Wide brand showcase banner displayed on the brand products page (recommended: 1200×300px).
                      </p>
                    </div>

                    <div className="space-y-3">
                      {bannerPreview && (
                        <div className="relative w-full h-32 rounded-xl border overflow-hidden bg-secondary/30">
                          <Image
                            src={bannerPreview}
                            alt="Banner Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              setBannerFile(null);
                              setBannerPreview("");
                              setValue("banner", "");
                            }}
                            className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}

                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                      />

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => bannerInputRef.current?.click()}
                          className="gap-1.5 text-xs"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Banner</span>
                        </Button>
                        <Input
                          {...register("banner")}
                          value={watch("banner") || ""}
                          onChange={(e) => {
                            setValue("banner", e.target.value);
                            setBannerPreview(e.target.value);
                          }}
                          placeholder="Or paste banner image URL..."
                          className="font-mono text-xs h-9 flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Display & SEO */}
              {activeTab === "seo" && (
                <div className="space-y-5">
                  {/* Visibility & Display Switches */}
                  <div className="p-4 rounded-xl border bg-card space-y-4">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary" /> Display & Placement Settings
                    </Label>

                    <div className="space-y-3">
                      {/* Featured toggle */}
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs sm:text-sm">Featured Brand</div>
                          <div className="text-xs text-muted-foreground">
                            Highlight this brand in the homepage brand slider and filter headers.
                          </div>
                        </div>
                        <Switch
                          checked={isFeaturedValue}
                          onCheckedChange={(checked) => setValue("isFeatured", checked)}
                        />
                      </div>

                      {/* Order */}
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs sm:text-sm">Display Sort Order</div>
                          <div className="text-xs text-muted-foreground">
                            Order priority index (e.g. 0, 1, 2) in brand listings.
                          </div>
                        </div>
                        <Input
                          type="number"
                          {...register("order")}
                          className="w-24 text-center font-mono h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEO Metadata */}
                  <div className="p-4 rounded-xl border bg-card space-y-4">
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-primary" /> Search Engine Optimization (SEO)
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Customize meta titles and descriptions for brand index pages.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="brand-meta-title" className="text-xs font-semibold">
                          Meta Title
                        </Label>
                        <Input
                          id="brand-meta-title"
                          {...register("metaTitle")}
                          placeholder={brandName ? `${brandName} Products in Bangladesh` : "Brand SEO Title..."}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="brand-meta-desc" className="text-xs font-semibold">
                          Meta Description
                        </Label>
                        <Textarea
                          id="brand-meta-desc"
                          {...register("metaDescription")}
                          rows={2}
                          placeholder="Brief summary for search engine snippet..."
                          className="text-xs resize-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="brand-meta-keywords" className="text-xs font-semibold">
                          Keywords (comma-separated)
                        </Label>
                        <Input
                          id="brand-meta-keywords"
                          {...register("metaKeywords")}
                          placeholder="brand products, authentic, official warranty"
                          className="text-xs h-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="px-6 py-4 border-t bg-muted/40 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {brandToEdit?.id ? (
                  <span className="font-mono text-xs">ID: {brandToEdit.id}</span>
                ) : (
                  <span>Ready to register new brand</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  disabled={isSubmitting}
                  className="h-10 px-4 text-xs font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-6 font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploadingMedia ? "Uploading Media..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {brandToEdit ? "Save Changes" : "Create Brand"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!brandToDelete} onOpenChange={(open) => !open && setBrandToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the brand &quot;
              {brandToDelete?.name}&quot; from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBrand}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Brand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
