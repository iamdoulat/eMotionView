"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  FolderPlus,
  Folder,
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
  ArrowUpDown,
  Lock,
  Unlock,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc, docToJSON } from "@/lib/db";
import { db } from "@/lib/db";
import { uploadFile, getFileUrl } from "@/lib/r2";
import { cn } from "@/lib/utils";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  permalink: z.string().min(1, "Permalink is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().optional(),
  banner: z.string().optional(),
  parentId: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  showInMenu: z.boolean().default(true),
  order: z.coerce.number().default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [isPermalinkManuallyEdited, setIsPermalinkManuallyEdited] = useState(false);

  // File upload states
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      isFeatured: false,
      showInMenu: true,
      order: 0,
    },
  });

  const categoryName = watch("name");
  const currentPermalink = watch("permalink");
  const currentDescription = watch("description");
  const currentParentId = watch("parentId");
  const isFeaturedValue = watch("isFeatured");
  const showInMenuValue = watch("showInMenu");

  // Auto-generate permalink when name changes
  useEffect(() => {
    if (!isPermalinkManuallyEdited && categoryName) {
      const generatedPermalink = categoryName
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("permalink", generatedPermalink, { shouldValidate: true });
    }
  }, [categoryName, isPermalinkManuallyEdited, setValue]);

  // Fetch categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoryList = categoriesSnapshot.docs.map((doc) => docToJSON(doc) as Category);
        setCategories(categoryList);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast({
          variant: "destructive",
          title: "Error Fetching Categories",
          description: "Could not load category data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  const handleOpenForm = (category?: Category) => {
    setActiveTab("general");
    setIconFile(null);
    setBannerFile(null);

    if (category) {
      setCategoryToEdit(category);
      reset({
        id: category.id,
        name: category.name || "",
        permalink: category.permalink || "",
        description: category.description || "",
        image: category.image || "",
        banner: category.banner || "",
        parentId: category.parentId || "none",
        isFeatured: category.isFeatured || false,
        showInMenu: category.showInMenu !== false,
        order: category.order || 0,
        metaTitle: category.metaTitle || "",
        metaDescription: category.metaDescription || "",
        metaKeywords: category.metaKeywords || "",
      });
      setIconPreview(category.image || "");
      setBannerPreview(category.banner || "");
      setIsPermalinkManuallyEdited(true);
    } else {
      setCategoryToEdit(null);
      reset({
        name: "",
        permalink: "",
        description: "",
        image: "",
        banner: "",
        parentId: "none",
        isFeatured: false,
        showInMenu: true,
        order: 0,
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
      });
      setIconPreview("");
      setBannerPreview("");
      setIsPermalinkManuallyEdited(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setCategoryToEdit(null);
    setIsFormOpen(false);
    setIconFile(null);
    setBannerFile(null);
    setIconPreview("");
    setBannerPreview("");
  };

  // Icon upload handler
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const url = URL.createObjectURL(file);
      setIconPreview(url);
    }
  };

  // Banner upload handler
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const handleSaveCategory: SubmitHandler<CategoryFormData> = async (data) => {
    setIsSubmitting(true);
    setIsUploadingMedia(true);
    try {
      let finalImageUrl = data.image || "";
      let finalBannerUrl = data.banner || "";

      // 1. Upload category icon to R2 if selected
      if (iconFile) {
        const path = `categories/icons/${Date.now()}-${iconFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        await uploadFile(path, iconFile, iconFile.type);
        finalImageUrl = await getFileUrl(path);
      }

      // 2. Upload banner to R2 if selected
      if (bannerFile) {
        const path = `categories/banners/${Date.now()}-${bannerFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        await uploadFile(path, bannerFile, bannerFile.type);
        finalBannerUrl = await getFileUrl(path);
      }

      // 3. Resolve parent category name
      const parentId = data.parentId === "none" || !data.parentId ? null : data.parentId;
      const parentCategory = parentId ? categories.find((c) => c.id === parentId) : null;
      const parentName = parentCategory ? parentCategory.name : null;

      const categoryPayload = {
        name: data.name.trim(),
        permalink: data.permalink.trim(),
        description: data.description.trim(),
        image: finalImageUrl,
        banner: finalBannerUrl,
        parentId,
        parentName,
        isFeatured: Boolean(data.isFeatured),
        showInMenu: Boolean(data.showInMenu),
        order: Number(data.order) || 0,
        metaTitle: data.metaTitle?.trim() || "",
        metaDescription: data.metaDescription?.trim() || "",
        metaKeywords: data.metaKeywords?.trim() || "",
      };

      if (categoryToEdit) {
        // Update existing category
        const docRef = doc(db, "categories", categoryToEdit.id);
        await setDoc(docRef, categoryPayload, { merge: true });
        setCategories(
          categories.map((c) =>
            c.id === categoryToEdit.id ? { ...categoryPayload, id: categoryToEdit.id } : c
          )
        );
        toast({ title: "Success", description: "Category updated successfully." });
      } else {
        // Create new category
        const docRef = await addDoc(collection(db, "categories"), categoryPayload);
        setCategories([...categories, { ...categoryPayload, id: docRef.id }]);
        toast({ title: "Success", description: "New category created successfully." });
      }
      handleCloseForm();
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save the category. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploadingMedia(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteDoc(doc(db, "categories", categoryToDelete.id));
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      toast({ title: "Success", description: "Category deleted successfully." });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete category." });
    } finally {
      setCategoryToDelete(null);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (cat.name && cat.name.toLowerCase().includes(q)) ||
      (cat.permalink && cat.permalink.toLowerCase().includes(q)) ||
      (cat.description && cat.description.toLowerCase().includes(q))
    );
  });

  const featuredCount = categories.filter((c) => c.isFeatured).length;
  const topLevelCount = categories.filter((c) => !c.parentId).length;

  return (
    <div className="space-y-6">
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Layers className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl">Product Categories</CardTitle>
              </div>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                Organize your catalog with hierarchical categories, custom icons, banners, and SEO metadata.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                <span>Total:</span>
                <strong className="text-foreground">{categories.length}</strong>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
                <span>Featured:</span>
                <strong>{featuredCount}</strong>
              </div>
              <Button onClick={() => handleOpenForm()} className="shadow-xs font-semibold">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="pt-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories by name, slug..."
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
                  <TableHead className="w-[300px]">Category</TableHead>
                  <TableHead>Permalink / URL</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center w-[120px]">Order</TableHead>
                  <TableHead className="text-center w-[160px]">Visibility</TableHead>
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
                        <span className="text-xs text-muted-foreground">Loading categories...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-full border bg-secondary/50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                            {category.image ? (
                              <Image
                                src={category.image}
                                alt={category.name}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <Folder className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-foreground truncate flex items-center gap-1.5">
                              <span>{category.name}</span>
                              {category.isFeatured && (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {category.parentId && category.parentName ? (
                                <span className="flex items-center gap-1 text-[11px]">
                                  <span>Sub of:</span>
                                  <span className="font-medium text-foreground">{category.parentName}</span>
                                </span>
                              ) : (
                                <span className="text-[11px]">Top Level Category</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/category/${category.permalink}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <span>/category/{category.permalink}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </TableCell>

                      <TableCell>
                        <p className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                          {category.description || "—"}
                        </p>
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs">
                        {category.order ?? 0}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {category.showInMenu !== false ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                              In Menu
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs">Category Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/category/${category.permalink}`} target="_blank" className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Page
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenForm(category)} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4 text-amber-500" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() => setCategoryToDelete(category)}
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
                        ? `No categories matching "${searchQuery}".`
                        : "No categories found. Click 'Add Category' to create your first collection."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredCategories.length}</strong> of <strong>{categories.length}</strong> categories.
          </div>
        </CardFooter>
      </Card>

      {/* Modernized Add / Edit Category Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl w-[95vw] h-[85vh] max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card gap-0">
          {/* Sticky Dialog Header */}
          <DialogHeader className="px-6 py-4 border-b bg-card shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shadow-xs shrink-0",
                    categoryToEdit
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {categoryToEdit ? <Edit className="h-5 w-5" /> : <FolderPlus className="h-5 w-5" />}
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">
                    {categoryToEdit ? `Edit Category: ${categoryToEdit.name}` : "Add New Category"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {categoryToEdit
                      ? "Update category details, thumbnail icon, parent hierarchy, and SEO."
                      : "Create a new product category, set URL slug, and upload thumbnail icon."}
                  </DialogDescription>
                </div>
              </div>

              {categoryToEdit && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {categoryToEdit.permalink && (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      /{categoryToEdit.permalink}
                    </Badge>
                  )}
                  {categoryToEdit.isFeatured && (
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
            onSubmit={handleSubmit(handleSaveCategory)}
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
                    <Layers className="h-4 w-4 shrink-0" />
                    <span>General Info</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="py-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon className="h-4 w-4 shrink-0" />
                    <span>Media & Icon</span>
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
                  {/* Category Name */}
                  <div className="space-y-2">
                    <Label htmlFor="category-name" className="text-sm font-semibold flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-primary" /> Category Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="category-name"
                      {...register("name")}
                      placeholder="e.g. Smartwatches & Bands"
                      disabled={isSubmitting}
                      className="h-10 text-sm font-medium"
                      autoFocus
                    />
                    {errors.name && <p className="text-destructive text-xs font-medium">{errors.name.message}</p>}
                  </div>

                  {/* Permalink / Slug with lock button and live URL preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="category-permalink" className="text-sm font-semibold flex items-center gap-1.5">
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
                        /category/
                      </span>
                      <Input
                        id="category-permalink"
                        {...register("permalink")}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          setIsPermalinkManuallyEdited(true);
                          setValue("permalink", e.target.value, { shouldValidate: true });
                        }}
                        placeholder="smartwatches-and-bands"
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
                          Storefront URL: <strong>/category/{currentPermalink}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Parent Category Hierarchy */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-primary" /> Parent Category
                    </Label>
                    <Select
                      value={currentParentId || "none"}
                      onValueChange={(val) => setValue("parentId", val === "none" ? null : val)}
                    >
                      <SelectTrigger className="h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select Parent Category (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="font-semibold text-primary">None (Top Level Category)</span>
                        </SelectItem>
                        {categories
                          .filter((c) => !categoryToEdit || c.id !== categoryToEdit.id)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Nest this category under an existing top-level category to create a sub-collection.
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="category-description" className="text-sm font-semibold">
                        Category Description <span className="text-destructive">*</span>
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {(currentDescription || "").length} characters
                      </span>
                    </div>
                    <Textarea
                      id="category-description"
                      {...register("description")}
                      rows={4}
                      disabled={isSubmitting}
                      placeholder="Brief overview of the category displayed in search results and category headers..."
                      className="text-xs sm:text-sm resize-none"
                    />
                    {errors.description && (
                      <p className="text-destructive text-xs font-medium">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Media & Branding */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  {/* Category Thumbnail / Icon */}
                  <div className="p-4 rounded-xl border bg-card space-y-4">
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-primary" /> Category Icon / Thumbnail
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Featured in the homepage circular category carousel, menus, and product cards (recommended: 128×128px PNG, SVG, or WebP).
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border bg-secondary/20">
                      {/* Circular preview matching storefront homepage popular category card */}
                      <div className="text-center shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-primary/30 bg-background flex items-center justify-center overflow-hidden shadow-sm mx-auto relative group">
                          {iconPreview ? (
                            <Image
                              src={iconPreview}
                              alt="Category Icon Preview"
                              width={112}
                              height={112}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <Folder className="h-10 w-10 text-muted-foreground/40" />
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground mt-2 block">
                          Storefront Preview
                        </span>
                      </div>

                      {/* Upload / URL controls */}
                      <div className="flex-1 w-full space-y-3">
                        <input
                          ref={iconInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleIconChange}
                          className="hidden"
                        />

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => iconInputRef.current?.click()}
                            className="gap-1.5"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload to Cloudflare R2</span>
                          </Button>

                          {iconPreview && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIconFile(null);
                                setIconPreview("");
                                setValue("image", "");
                              }}
                              className="text-destructive hover:text-destructive gap-1 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </Button>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="category-image-url" className="text-xs text-muted-foreground">
                            Or direct Image URL
                          </Label>
                          <Input
                            id="category-image-url"
                            {...register("image")}
                            value={watch("image") || ""}
                            onChange={(e) => {
                              setValue("image", e.target.value);
                              setIconPreview(e.target.value);
                            }}
                            placeholder="https://example.com/icon.png or /api/r2/proxy?key=..."
                            className="font-mono text-xs h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Hero Banner */}
                  <div className="p-4 rounded-xl border bg-card space-y-4">
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-primary" /> Category Hero Banner (Optional)
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Wide header banner displayed at the top of the category products page (recommended: 1200×300px).
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
                      <Sparkles className="h-4 w-4 text-primary" /> Navigation & Visibility Settings
                    </Label>

                    <div className="space-y-3">
                      {/* Featured toggle */}
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs sm:text-sm">Featured on Homepage</div>
                          <div className="text-xs text-muted-foreground">
                            Display this category prominently in the homepage &quot;Explore Popular Categories&quot; circle carousel.
                          </div>
                        </div>
                        <Switch
                          checked={isFeaturedValue}
                          onCheckedChange={(checked) => setValue("isFeatured", checked)}
                        />
                      </div>

                      {/* Show in menu toggle */}
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs sm:text-sm">Show in Navigation Menu</div>
                          <div className="text-xs text-muted-foreground">
                            Display this category in the &quot;All Categories&quot; header menu and mobile sidebar drawer.
                          </div>
                        </div>
                        <Switch
                          checked={showInMenuValue}
                          onCheckedChange={(checked) => setValue("showInMenu", checked)}
                        />
                      </div>

                      {/* Order */}
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs sm:text-sm">Display Sort Order</div>
                          <div className="text-xs text-muted-foreground">
                            Order priority index (e.g. 0, 1, 2) in menu listings and grids.
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
                        Customize meta titles and descriptions for Google and social media indexing.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="meta-title" className="text-xs font-semibold">
                          Meta Title
                        </Label>
                        <Input
                          id="meta-title"
                          {...register("metaTitle")}
                          placeholder={categoryName ? `${categoryName} | Buy Online` : "Category SEO Title..."}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="meta-desc" className="text-xs font-semibold">
                          Meta Description
                        </Label>
                        <Textarea
                          id="meta-desc"
                          {...register("metaDescription")}
                          rows={2}
                          placeholder="Brief summary for search engine snippet..."
                          className="text-xs resize-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="meta-keywords" className="text-xs font-semibold">
                          Keywords (comma-separated)
                        </Label>
                        <Input
                          id="meta-keywords"
                          {...register("metaKeywords")}
                          placeholder="smartwatch, bluetooth calling, fitness tracker"
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
                {categoryToEdit?.id ? (
                  <span className="font-mono text-xs">ID: {categoryToEdit.id}</span>
                ) : (
                  <span>Ready to publish new category</span>
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
                      {categoryToEdit ? "Save Changes" : "Create Category"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category &quot;
              {categoryToDelete?.name}&quot; from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
