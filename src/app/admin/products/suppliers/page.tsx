"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import {
  type Supplier,
  suppliers as defaultSuppliers,
} from "@/lib/placeholder-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc, docToJSON } from "@/lib/db";
import { db } from "@/lib/db";
import { uploadFile, getFileUrl } from "@/lib/r2";
import {
  MoreHorizontal,
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  Building2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Search,
  Lock,
  Unlock,
  UploadCloud,
  FileText,
  UserCheck,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Eye,
} from "lucide-react";

// Form Schema
const supplierSchema = z.object({
  name: z.string().min(1, "Supplier / Vendor name is required"),
  permalink: z
    .string()
    .min(1, "Permalink slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  contactPerson: z.string().min(1, "Contact person name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().optional().refine((val) => !val || /^https?:\/\//i.test(val), {
    message: "Website must start with http:// or https://",
  }),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Auto-slug Lock
  const [isPermalinkLocked, setIsPermalinkLocked] = useState(true);

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      permalink: "",
      contactPerson: "",
      email: "",
      phone: "",
      company: "",
      logo: "",
      website: "",
      address: "",
      city: "",
      country: "",
      taxId: "",
      status: "active",
      notes: "",
    },
  });

  const watchedName = watch("name");
  const watchedPermalink = watch("permalink");
  const watchedLogo = watch("logo");
  const watchedStatus = watch("status");

  // Load suppliers from DB with fallback to defaultSuppliers
  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const suppliersSnapshot = await getDocs(collection(db, "suppliers"));
      if (suppliersSnapshot.empty) {
        setSuppliers(
          defaultSuppliers.map((s, idx) => ({
            ...s,
            id: s.permalink || `sup-${idx + 1}`,
          }))
        );
      } else {
        const loaded = suppliersSnapshot.docs.map(docToJSON) as Supplier[];
        setSuppliers(loaded);
      }
    } catch {
      setSuppliers(
        defaultSuppliers.map((s, idx) => ({
          ...s,
          id: s.permalink || `sup-${idx + 1}`,
        }))
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Auto-generate permalink when name changes if auto-sync is unlocked
  useEffect(() => {
    if (!isPermalinkLocked && watchedName) {
      const generated = watchedName
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("permalink", generated, { shouldValidate: true });
    }
  }, [watchedName, isPermalinkLocked, setValue]);

  // Open Form Dialog
  const handleOpenForm = (supplier?: Supplier) => {
    setActiveTab("general");
    setSupplierToEdit(supplier || null);
    setIsPermalinkLocked(!!supplier); // unlock for new, lock for edit
    setLogoFile(null);

    if (supplier) {
      reset({
        name: supplier.name,
        permalink: supplier.permalink,
        contactPerson: supplier.contactPerson || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        company: supplier.company || "",
        logo: supplier.logo || "",
        website: supplier.website || "",
        address: supplier.address || "",
        city: supplier.city || "",
        country: supplier.country || "",
        taxId: supplier.taxId || "",
        status: supplier.status || "active",
        notes: supplier.notes || "",
      });
      setLogoPreview(supplier.logo || "");
    } else {
      reset({
        name: "",
        permalink: "",
        contactPerson: "",
        email: "",
        phone: "",
        company: "",
        logo: "",
        website: "",
        address: "",
        city: "Dhaka",
        country: "Bangladesh",
        taxId: "",
        status: "active",
        notes: "",
      });
      setLogoPreview("");
    }

    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSupplierToEdit(null);
    setIsFormOpen(false);
    setLogoFile(null);
    setLogoPreview("");
  };

  // Handle logo file selection
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied to clipboard", description: text });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit Handler: Add or Edit Supplier
  const handleSaveSupplier = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    try {
      let finalLogoUrl = data.logo || "";

      // 1. Upload logo to R2 if selected
      if (logoFile) {
        setIsUploadingLogo(true);
        const path = `suppliers/logos/${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        await uploadFile(path, logoFile, logoFile.type);
        finalLogoUrl = await getFileUrl(path);
      }

      const supplierPayload: Omit<Supplier, "id"> = {
        name: data.name.trim(),
        permalink: data.permalink.trim(),
        contactPerson: data.contactPerson.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || "",
        company: data.company?.trim() || "",
        logo: finalLogoUrl,
        website: data.website?.trim() || "",
        address: data.address?.trim() || "",
        city: data.city?.trim() || "",
        country: data.country?.trim() || "",
        taxId: data.taxId?.trim() || "",
        status: data.status,
        notes: data.notes?.trim() || "",
      };

      if (supplierToEdit) {
        const docRef = doc(db, "suppliers", supplierToEdit.id);
        await setDoc(docRef, supplierPayload, { merge: true });

        setSuppliers((prev) =>
          prev.map((s) => (s.id === supplierToEdit.id ? { ...s, ...supplierPayload } : s))
        );

        toast({
          title: "Supplier Updated",
          description: `"${data.name}" profile has been updated.`,
        });
      } else {
        const docRef = await addDoc(collection(db, "suppliers"), supplierPayload);
        const newSupplier: Supplier = {
          id: docRef.id,
          ...supplierPayload,
        };

        setSuppliers((prev) => [...prev, newSupplier]);

        toast({
          title: "Supplier Created",
          description: `"${data.name}" has been registered as a vendor.`,
        });
      }

      handleCloseForm();
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save supplier information. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploadingLogo(false);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    try {
      await deleteDoc(doc(db, "suppliers", supplierToDelete.id));
      setSuppliers((prev) => prev.filter((s) => s.id !== supplierToDelete.id));
      toast({
        title: "Supplier Deleted",
        description: `"${supplierToDelete.name}" has been removed from suppliers.`,
      });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete supplier.",
      });
    } finally {
      setSupplierToDelete(null);
    }
  };

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        searchQuery === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.company && s.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.permalink.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || (s.status || "active") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, statusFilter]);

  // Stats summary
  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter((s) => (s.status || "active") === "active").length;
    const pending = suppliers.filter((s) => s.status === "pending").length;
    return { total, active, pending };
  }, [suppliers]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold tracking-tight">Suppliers & Vendors</CardTitle>
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-primary/5 text-primary border-primary/20">
                  Supply Chain
                </Badge>
              </div>
              <CardDescription className="text-sm mt-1">
                Manage product manufacturers, local distributors, and official brand import partners.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleOpenForm()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters and Stats Bar */}
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 pb-4 border-t border-border/50">
            {/* Search and Filters */}
            <div className="flex flex-1 items-center gap-3 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vendor, contact, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm bg-background"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Vendors</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Live Stats Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-lg border bg-muted/30 font-medium">
                Total Vendors: <span className="font-semibold text-foreground ml-1">{stats.total}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg border bg-muted/30 font-medium text-emerald-600 dark:text-emerald-400">
                Active: <span className="font-semibold text-foreground ml-1">{stats.active}</span>
              </div>
              {stats.pending > 0 && (
                <div className="px-3 py-1.5 rounded-lg border bg-muted/30 font-medium text-amber-600 dark:text-amber-400">
                  Pending: <span className="font-semibold text-foreground ml-1">{stats.pending}</span>
                </div>
              )}
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="rounded-xl border border-border/80 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[240px]">Supplier / Vendor</TableHead>
                  <TableHead className="w-[180px]">Contact Person</TableHead>
                  <TableHead className="w-[220px]">Contact Info</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[110px] text-center">Status</TableHead>
                  <TableHead className="w-[70px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-sm">Loading suppliers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Building2 className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium">No suppliers found</p>
                        <p className="text-xs text-muted-foreground/80">
                          {searchQuery ? "Try refining your search filter." : "Click 'Add Supplier' to register a new vendor partner."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-muted/30 transition-colors">
                      {/* Name & Logo & Link */}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0 relative">
                            {supplier.logo ? (
                              <Image
                                src={supplier.logo}
                                alt={supplier.name}
                                fill
                                sizes="40px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-muted-foreground/60" />
                            )}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="font-semibold text-foreground text-sm truncate flex items-center gap-1.5">
                              <span>{supplier.name}</span>
                            </div>
                            {supplier.company && (
                              <div className="text-xs text-muted-foreground truncate">{supplier.company}</div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/supplier/${supplier.permalink}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline"
                              >
                                <span>/supplier/{supplier.permalink}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Person */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{supplier.contactPerson}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">Account Representative</div>
                        </div>
                      </TableCell>

                      {/* Email & Phone */}
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                            <a href={`mailto:${supplier.email}`} className="truncate hover:underline">
                              {supplier.email}
                            </a>
                          </div>
                          {supplier.phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <a href={`tel:${supplier.phone}`} className="hover:underline">
                                {supplier.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div className="flex items-center gap-1 text-foreground font-medium">
                            <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                            <span>
                              {[supplier.city, supplier.country].filter(Boolean).join(", ") || "Unspecified"}
                            </span>
                          </div>
                          {supplier.address && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{supplier.address}</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        {supplier.status === "inactive" ? (
                          <Badge variant="outline" className="text-muted-foreground text-[11px]">
                            Inactive
                          </Badge>
                        ) : supplier.status === "pending" ? (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px]">
                            Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px]">
                            Active
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs">Supplier Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/supplier/${supplier.permalink}`}
                                target="_blank"
                                className="cursor-pointer flex items-center"
                              >
                                <ExternalLink className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                <span>View Storefront</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenForm(supplier)} className="cursor-pointer">
                              <Edit className="mr-2 h-3.5 w-3.5 text-primary" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer focus:bg-destructive/10"
                              onClick={() => setSupplierToDelete(supplier)}
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Supplier
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/50 py-3">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredSuppliers.length}</strong> of <strong>{suppliers.length}</strong> suppliers.
          </div>
        </CardFooter>
      </Card>

      {/* =========================================================================
          ADD / EDIT SUPPLIER MODAL DIALOG
      ========================================================================= */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl w-[95vw] h-[85vh] max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card gap-0">
          {/* PINNED DIALOG HEADER */}
          <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 shrink-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
                    {supplierToEdit ? "Edit Supplier" : "Add Supplier"}
                  </Badge>
                  {watchedPermalink && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                      /supplier/{watchedPermalink}
                    </span>
                  )}
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {supplierToEdit ? `Edit Supplier: ${supplierToEdit.name}` : "Add New Supplier"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Register vendor profile, representative contact info, warehouse address, and brand logo.
                </DialogDescription>
              </div>

              {/* Status Badge in Header */}
              <div className="hidden sm:flex items-center gap-2 sm:mr-8">
                {watchedStatus === "inactive" ? (
                  <Badge variant="outline" className="text-xs">Inactive</Badge>
                ) : watchedStatus === "pending" ? (
                  <Badge className="bg-amber-500/15 text-amber-600 text-xs border-amber-500/30">Pending Review</Badge>
                ) : (
                  <Badge className="bg-emerald-500/15 text-emerald-600 text-xs border-emerald-500/30">Active Vendor</Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* FORM WRAPPER */}
          <form onSubmit={handleSubmit(handleSaveSupplier)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
              {/* PINNED TABS NAV */}
              <div className="px-6 pt-3.5 pb-2 border-b border-border/40 bg-card/60 shrink-0">
                <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-xl">
                  <TabsTrigger value="general" className="flex items-center gap-2 text-xs font-semibold py-2">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Vendor Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-2 text-xs font-semibold py-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Contact & Location</span>
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex items-center gap-2 text-xs font-semibold py-2">
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Logo & Terms</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* SCROLLABLE DIALOG BODY */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 overscroll-contain modal-scrollbar space-y-6">
                {/* =========================================================================
                    TAB 1: VENDOR PROFILE
                ========================================================================= */}
                <TabsContent value="general" className="m-0 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Supplier Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="supplier-name" className="text-xs font-semibold">
                        Supplier / Vendor Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="supplier-name"
                        placeholder="e.g. KOSPET Direct, Haylou Official"
                        {...register("name")}
                        className="h-10 text-sm"
                      />
                      {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                      <p className="text-[11px] text-muted-foreground">The vendor brand name selected in product forms.</p>
                    </div>

                    {/* Storefront Permalink with auto-sync */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="supplier-permalink" className="text-xs font-semibold">
                          Storefront Permalink Slug <span className="text-destructive">*</span>
                        </Label>
                        <button
                          type="button"
                          onClick={() => setIsPermalinkLocked(!isPermalinkLocked)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isPermalinkLocked ? (
                            <>
                              <Lock className="h-3 w-3 text-primary" /> Auto-sync enabled
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3 w-3 text-amber-500" /> Manual editing
                            </>
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="supplier-permalink"
                          placeholder="e.g. kospet-direct, haylou-official"
                          {...register("permalink")}
                          disabled={isPermalinkLocked}
                          className="h-10 text-sm font-mono"
                        />
                      </div>
                      {errors.permalink && <p className="text-destructive text-xs">{errors.permalink.message}</p>}
                      <p className="text-[11px] text-muted-foreground">
                        Customer URL: <span className="font-mono text-foreground">/supplier/{watchedPermalink || "slug"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Legal Company Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="supplier-company" className="text-xs font-semibold">
                        Company / Legal Business Entity
                      </Label>
                      <Input
                        id="supplier-company"
                        placeholder="e.g. KOSPET Technology Inc."
                        {...register("company")}
                        className="h-10 text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground">Registered company name for invoices and purchase orders.</p>
                    </div>

                    {/* Official Website */}
                    <div className="space-y-1.5">
                      <Label htmlFor="supplier-website" className="text-xs font-semibold">
                        Official Website URL
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="supplier-website"
                          placeholder="https://kospet.com"
                          {...register("website")}
                          className="h-10 text-sm pl-9"
                        />
                      </div>
                      {errors.website && <p className="text-destructive text-xs">{errors.website.message}</p>}
                      <p className="text-[11px] text-muted-foreground">Vendor's primary corporate or distributor portal.</p>
                    </div>
                  </div>

                  {/* Vendor Status */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold">Vendor Partnership Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div
                            onClick={() => field.onChange("active")}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                              field.value === "active"
                                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                                : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className={`h-4 w-4 ${field.value === "active" ? "text-emerald-500" : "text-muted-foreground"}`} />
                              <div>
                                <div className="text-xs font-bold text-foreground">Active Vendor</div>
                                <p className="text-[10px] text-muted-foreground">Approved for inventory</p>
                              </div>
                            </div>
                            {field.value === "active" && <Check className="h-4 w-4 text-emerald-500" />}
                          </div>

                          <div
                            onClick={() => field.onChange("pending")}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                              field.value === "pending"
                                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20"
                                : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <AlertCircle className={`h-4 w-4 ${field.value === "pending" ? "text-amber-500" : "text-muted-foreground"}`} />
                              <div>
                                <div className="text-xs font-bold text-foreground">Pending Review</div>
                                <p className="text-[10px] text-muted-foreground">Contract in progress</p>
                              </div>
                            </div>
                            {field.value === "pending" && <Check className="h-4 w-4 text-amber-500" />}
                          </div>

                          <div
                            onClick={() => field.onChange("inactive")}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                              field.value === "inactive"
                                ? "border-slate-500 bg-slate-50/50 dark:bg-slate-950/20 ring-2 ring-slate-500/20"
                                : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <X className={`h-4 w-4 ${field.value === "inactive" ? "text-slate-500" : "text-muted-foreground"}`} />
                              <div>
                                <div className="text-xs font-bold text-foreground">Inactive</div>
                                <p className="text-[10px] text-muted-foreground">Paused supply agreement</p>
                              </div>
                            </div>
                            {field.value === "inactive" && <Check className="h-4 w-4 text-slate-500" />}
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* =========================================================================
                    TAB 2: CONTACT & LOCATION
                ========================================================================= */}
                <TabsContent value="contact" className="m-0 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Person */}
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-person" className="text-xs font-semibold">
                        Primary Contact Person <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contact-person"
                        placeholder="e.g. John Kospet"
                        {...register("contactPerson")}
                        className="h-10 text-sm"
                      />
                      {errors.contactPerson && <p className="text-destructive text-xs">{errors.contactPerson.message}</p>}
                      <p className="text-[11px] text-muted-foreground">Account manager or distributor sales director.</p>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <Label htmlFor="supplier-email" className="text-xs font-semibold">
                        Business Email <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="supplier-email"
                          type="email"
                          placeholder="sales@kospet.com"
                          {...register("email")}
                          className="h-10 text-sm pl-9"
                        />
                      </div>
                      {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                      <p className="text-[11px] text-muted-foreground">Direct email for order inquiries and RMA claims.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <Label htmlFor="supplier-phone" className="text-xs font-semibold">
                        Phone / Hotline Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="supplier-phone"
                          placeholder="+880 1711-223344"
                          {...register("phone")}
                          className="h-10 text-sm pl-9"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Direct phone or WhatsApp business contact.</p>
                    </div>

                    {/* Tax ID / Trade License */}
                    <div className="space-y-1.5">
                      <Label htmlFor="supplier-tax" className="text-xs font-semibold">
                        Tax ID / Trade License / BIN
                      </Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="supplier-tax"
                          placeholder="e.g. BIN-0012938475"
                          {...register("taxId")}
                          className="h-10 text-sm pl-9 font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Business identification for official compliance.</p>
                    </div>
                  </div>

                  {/* Physical Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="supplier-address" className="text-xs font-semibold">
                      Warehouse / Office Physical Address
                    </Label>
                    <Input
                      id="supplier-address"
                      placeholder="e.g. High-Tech Industrial Park, Building 3, Nanshan"
                      {...register("address")}
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* City */}
                    <div className="space-y-1.5">
                      <Label htmlFor="supplier-city" className="text-xs font-semibold">City</Label>
                      <Input
                        id="supplier-city"
                        placeholder="e.g. Shenzhen, Dhaka"
                        {...register("city")}
                        className="h-10 text-sm"
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-1.5">
                      <Label htmlFor="supplier-country" className="text-xs font-semibold">Country</Label>
                      <Input
                        id="supplier-country"
                        placeholder="e.g. China, Bangladesh"
                        {...register("country")}
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* =========================================================================
                    TAB 3: LOGO & MEDIA & TERMS
                ========================================================================= */}
                <TabsContent value="media" className="m-0 space-y-6">
                  {/* Vendor Official Logo Upload */}
                  <div className="p-4 rounded-xl border bg-card/60 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs font-bold text-foreground">Official Vendor Logo</Label>
                        <p className="text-[11px] text-muted-foreground">
                          Recommended format: Transparent PNG or SVG (max 400×200px)
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Cloudflare R2</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Upload Controls */}
                      <div className="space-y-3">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => logoInputRef.current?.click()}
                            className="flex-1 h-10 text-xs font-semibold bg-background hover:bg-muted"
                          >
                            <UploadCloud className="mr-2 h-4 w-4 text-primary" />
                            {logoFile ? "Change Selected File" : "Upload to Cloudflare R2"}
                          </Button>
                          {(logoPreview || logoFile) && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview("");
                                setValue("logo", "");
                              }}
                              className="h-10 px-3 text-xs text-destructive hover:bg-destructive/10"
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Or Direct Image URL:</Label>
                          <Input
                            placeholder="https://..."
                            {...register("logo")}
                            onChange={(e) => {
                              setValue("logo", e.target.value);
                              setLogoPreview(e.target.value);
                            }}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Storefront Vendor Logo Preview Card */}
                      <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 min-h-[120px]">
                        {logoPreview ? (
                          <div className="relative w-36 h-16">
                            <Image
                              src={logoPreview}
                              alt="Supplier Logo Preview"
                              fill
                              sizes="144px"
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground/60 text-xs gap-1.5">
                            <Building2 className="h-8 w-8 text-muted-foreground/40" />
                            <span>No logo uploaded</span>
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground mt-2">
                          Storefront Brand / Vendor Card Preview
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Internal Supply Notes & Terms */}
                  <div className="space-y-1.5">
                    <Label htmlFor="supplier-notes" className="text-xs font-semibold flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      Internal Supply Terms & Contract Notes (Admin Only)
                    </Label>
                    <Textarea
                      id="supplier-notes"
                      placeholder="e.g. Credit terms: Net 30 days. MOQ: 50 units per shipment. RMA window: 14 business days."
                      rows={4}
                      {...register("notes")}
                      className="text-xs resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Confidential supply terms, shipment lead times, and payment details for internal staff.
                    </p>
                  </div>
                </TabsContent>
              </div>

              {/* PINNED DIALOG FOOTER */}
              <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between sm:justify-between shrink-0">
                <div className="text-xs text-muted-foreground">
                  {supplierToEdit ? (
                    <span className="font-mono bg-muted px-2 py-0.5 rounded border border-border/50">
                      ID: {supplierToEdit.id}
                    </span>
                  ) : (
                    <span>Ready to register new vendor</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseForm}
                    disabled={isSubmitting || isUploadingLogo}
                    className="h-9 px-4 text-xs font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploadingLogo}
                    className="h-9 px-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    {isSubmitting || isUploadingLogo ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : supplierToEdit ? (
                      "Save Changes"
                    ) : (
                      "Create Supplier"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </Tabs>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DELETE CONFIRMATION ALERT DIALOG
      ========================================================================= */}
      <AlertDialog open={!!supplierToDelete} onOpenChange={(open) => !open && setSupplierToDelete(null)}>
        <AlertDialogContent className="rounded-xl border border-border/80 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Delete Supplier?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently remove{" "}
              <strong>"{supplierToDelete?.name}"</strong> from your registered suppliers list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSupplier}
              className="h-9 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Supplier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
