"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  type Attribute,
  type AttributeValueDetail,
  attributes as defaultAttributes,
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  PlusCircle,
  Edit,
  Trash2,
  Palette,
  Box,
  ListFilter,
  CheckCircle2,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Lock,
  Unlock,
  Search,
  Loader2,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Info,
  Check,
  Eye,
  RefreshCw,
} from "lucide-react";

// Form validation schema
const attributeFormSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
  code: z
    .string()
    .min(1, "Attribute code / slug is required")
    .regex(/^[a-z0-9-]+$/, "Code must contain only lowercase letters, numbers, and hyphens"),
  displayType: z.enum(["button", "color", "select", "radio"]).default("button"),
  description: z.string().optional(),
  order: z.coerce.number().default(0),
  isRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type AttributeFormValues = z.infer<typeof attributeFormSchema>;

// Popular Presets for quick catalog setup
const PRESET_OPTIONS = {
  colors: [
    { name: "Black", hex: "#0f172a" },
    { name: "White", hex: "#ffffff" },
    { name: "Silver", hex: "#94a3b8" },
    { name: "Blue", hex: "#2563eb" },
    { name: "Red", hex: "#ef4444" },
    { name: "Space Grey", hex: "#475569" },
    { name: "Gold", hex: "#eab308" },
    { name: "Green", hex: "#16a34a" },
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  storage: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  ram: ["4GB", "6GB", "8GB", "12GB", "16GB"],
  watchSizes: ["40mm", "42mm", "44mm", "45mm", "46mm", "49mm Ultra"],
  straps: ["Silicone", "Stainless Steel", "Genuine Leather", "Nylon Braided"],
};

export default function AttributesPage() {
  const { toast } = useToast();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [attributeToEdit, setAttributeToEdit] = useState<Attribute | null>(null);
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-slug Lock
  const [isCodeLocked, setIsCodeLocked] = useState(true);

  // Managed Attribute Values & Details
  const [valuesList, setValuesList] = useState<string[]>([]);
  const [colorDetails, setColorDetails] = useState<Record<string, string>>({});
  const [newValueInput, setNewValueInput] = useState("");
  const [newColorHex, setNewColorHex] = useState("#2563eb");
  const [bulkInput, setBulkInput] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  // Live Storefront Preview Selection
  const [previewSelection, setPreviewSelection] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: "",
      code: "",
      displayType: "button",
      description: "",
      order: 0,
      isRequired: false,
      isActive: true,
    },
  });

  const watchedName = watch("name");
  const watchedCode = watch("code");
  const watchedDisplayType = watch("displayType");

  // Load Attributes from API with placeholder fallback
  const fetchAttributes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/data/attributes");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAttributes(
          data.map((a: any) => ({
            id: a._id || a.id || `attr-${a.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
            name: a.name,
            code: a.code || a.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            displayType: a.displayType || (a.name.toLowerCase().includes("color") ? "color" : "button"),
            description: a.description || "",
            values: a.values || [],
            valueDetails: a.valueDetails || [],
            order: a.order ?? 0,
            isRequired: a.isRequired ?? false,
            isActive: a.isActive ?? true,
          }))
        );
      } else {
        setAttributes(defaultAttributes);
      }
    } catch {
      setAttributes(defaultAttributes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  // Auto-generate slug when name changes if lock is active
  useEffect(() => {
    if (isCodeLocked && watchedName) {
      const generated = watchedName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("code", generated, { shouldValidate: true });
    }
  }, [watchedName, isCodeLocked, setValue]);

  // Open Form for Add or Edit
  const handleOpenForm = (attribute?: Attribute) => {
    setActiveTab("general");
    setAttributeToEdit(attribute || null);
    setIsCodeLocked(!attribute); // auto-sync for new, lock for edit

    if (attribute) {
      reset({
        name: attribute.name,
        code: attribute.code || attribute.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        displayType: attribute.displayType || (attribute.name.toLowerCase().includes("color") ? "color" : "button"),
        description: attribute.description || "",
        order: attribute.order ?? 0,
        isRequired: attribute.isRequired ?? false,
        isActive: attribute.isActive ?? true,
      });

      setValuesList(attribute.values || []);

      // Rehydrate color hex map
      const colorMap: Record<string, string> = {};
      if (attribute.valueDetails && attribute.valueDetails.length > 0) {
        attribute.valueDetails.forEach((vd) => {
          if (vd.colorHex) colorMap[vd.value] = vd.colorHex;
        });
      }
      setColorDetails(colorMap);
      setPreviewSelection(attribute.values?.[0] || "");
    } else {
      reset({
        name: "",
        code: "",
        displayType: "button",
        description: "",
        order: attributes.length + 1,
        isRequired: false,
        isActive: true,
      });
      setValuesList([]);
      setColorDetails({});
      setPreviewSelection("");
    }

    setNewValueInput("");
    setBulkInput("");
    setShowBulkAdd(false);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setAttributeToEdit(null);
  };

  // Add individual value
  const handleAddValue = () => {
    const trimmed = newValueInput.trim();
    if (!trimmed) return;
    if (valuesList.includes(trimmed)) {
      toast({
        title: "Value already exists",
        description: `"${trimmed}" is already added to this attribute.`,
        variant: "destructive",
      });
      return;
    }

    const nextList = [...valuesList, trimmed];
    setValuesList(nextList);

    if (watchedDisplayType === "color") {
      setColorDetails((prev) => ({
        ...prev,
        [trimmed]: newColorHex,
      }));
    }

    if (!previewSelection) {
      setPreviewSelection(trimmed);
    }

    setNewValueInput("");
  };

  // Bulk add comma-separated values
  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;
    const items = bulkInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const uniqueNew = items.filter((item) => !valuesList.includes(item));
    if (uniqueNew.length === 0) {
      toast({
        title: "No new values",
        description: "All entered values already exist.",
      });
      return;
    }

    const nextList = [...valuesList, ...uniqueNew];
    setValuesList(nextList);

    // If color type, assign default colors or neutral hex
    if (watchedDisplayType === "color") {
      const nextColors = { ...colorDetails };
      uniqueNew.forEach((val) => {
        const found = PRESET_OPTIONS.colors.find(
          (c) => c.name.toLowerCase() === val.toLowerCase()
        );
        nextColors[val] = found ? found.hex : "#64748b";
      });
      setColorDetails(nextColors);
    }

    if (!previewSelection && nextList.length > 0) {
      setPreviewSelection(nextList[0]);
    }

    setBulkInput("");
    setShowBulkAdd(false);
    toast({
      title: "Values added",
      description: `Added ${uniqueNew.length} new attribute values.`,
    });
  };

  // Apply Quick Preset
  const handleApplyPreset = (presetName: string) => {
    let presetValues: string[] = [];
    let presetHexMap: Record<string, string> = {};

    if (presetName === "colors") {
      presetValues = PRESET_OPTIONS.colors.map((c) => c.name);
      PRESET_OPTIONS.colors.forEach((c) => {
        presetHexMap[c.name] = c.hex;
      });
      setValue("displayType", "color");
    } else if (presetName === "sizes") {
      presetValues = PRESET_OPTIONS.sizes;
      setValue("displayType", "button");
    } else if (presetName === "storage") {
      presetValues = PRESET_OPTIONS.storage;
      setValue("displayType", "button");
    } else if (presetName === "ram") {
      presetValues = PRESET_OPTIONS.ram;
      setValue("displayType", "button");
    } else if (presetName === "watchSizes") {
      presetValues = PRESET_OPTIONS.watchSizes;
      setValue("displayType", "button");
    } else if (presetName === "straps") {
      presetValues = PRESET_OPTIONS.straps;
      setValue("displayType", "button");
    }

    // Merge without duplicates
    const combined = Array.from(new Set([...valuesList, ...presetValues]));
    setValuesList(combined);
    setColorDetails((prev) => ({ ...prev, ...presetHexMap }));

    if (!previewSelection && combined.length > 0) {
      setPreviewSelection(combined[0]);
    }

    toast({
      title: "Preset applied",
      description: `Loaded options from ${presetName}.`,
    });
  };

  // Remove individual value
  const handleRemoveValue = (valueToRemove: string) => {
    const nextList = valuesList.filter((v) => v !== valueToRemove);
    setValuesList(nextList);

    const nextColors = { ...colorDetails };
    delete nextColors[valueToRemove];
    setColorDetails(nextColors);

    if (previewSelection === valueToRemove) {
      setPreviewSelection(nextList[0] || "");
    }
  };

  // Move value up / down
  const handleMoveValue = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === valuesList.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const next = [...valuesList];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setValuesList(next);
  };

  // Update color hex for specific value
  const handleUpdateColorHex = (valueName: string, hex: string) => {
    setColorDetails((prev) => ({
      ...prev,
      [valueName]: hex,
    }));
  };

  // Submit Handler: Save Attribute
  const handleSaveAttribute = async (data: AttributeFormValues) => {
    if (valuesList.length === 0) {
      toast({
        title: "Values required",
        description: "Please add at least one attribute value in the 'Values & Options' tab.",
        variant: "destructive",
      });
      setActiveTab("values");
      return;
    }

    setIsSubmitting(true);
    try {
      const valueDetailsArray: AttributeValueDetail[] = valuesList.map((val) => ({
        value: val,
        colorHex: data.displayType === "color" ? colorDetails[val] || "#64748b" : undefined,
      }));

      const attributePayload: Partial<Attribute> = {
        name: data.name.trim(),
        code: data.code.trim(),
        displayType: data.displayType,
        description: data.description?.trim() || "",
        values: valuesList,
        valueDetails: valueDetailsArray,
        order: data.order,
        isRequired: data.isRequired,
        isActive: data.isActive,
      };

      if (attributeToEdit) {
        await fetch(`/api/data/attributes/${attributeToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attributePayload),
        });

        setAttributes((prev) =>
          prev.map((a) =>
            a.id === attributeToEdit.id ? { ...a, ...attributePayload } as Attribute : a
          )
        );

        toast({
          title: "Attribute Updated",
          description: `"${data.name}" has been successfully updated.`,
        });
      } else {
        const res = await fetch("/api/data/attributes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attributePayload),
        });
        const result = await res.json();
        const newAttr: Attribute = {
          ...attributePayload,
          id: result.id || `attr-${Date.now()}`,
        } as Attribute;

        setAttributes((prev) => [...prev, newAttr]);

        toast({
          title: "Attribute Created",
          description: `"${data.name}" has been created with ${valuesList.length} values.`,
        });
      }

      handleCloseForm();
    } catch {
      toast({
        title: "Failed to save",
        description: "An error occurred while saving the attribute.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteAttribute = async () => {
    if (!attributeToDelete) return;
    try {
      await fetch(`/api/data/attributes/${attributeToDelete.id}`, {
        method: "DELETE",
      });
      setAttributes((prev) => prev.filter((a) => a.id !== attributeToDelete.id));
      toast({
        title: "Attribute deleted",
        description: `"${attributeToDelete.name}" has been removed.`,
      });
    } catch {
      toast({
        title: "Delete failed",
        description: "Could not delete attribute.",
        variant: "destructive",
      });
    } finally {
      setAttributeToDelete(null);
    }
  };

  // Filtered attributes list
  const filteredAttributes = useMemo(() => {
    return attributes.filter((attr) => {
      const matchesSearch =
        searchQuery === "" ||
        attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (attr.code && attr.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        attr.values.some((v) => v.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        typeFilter === "all" ||
        (attr.displayType || "button") === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [attributes, searchQuery, typeFilter]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = attributes.length;
    const colors = attributes.filter((a) => a.displayType === "color").length;
    const buttons = attributes.filter((a) => (a.displayType || "button") === "button").length;
    const totalVals = attributes.reduce((acc, a) => acc + (a.values?.length || 0), 0);
    return { total, colors, buttons, totalVals };
  }, [attributes]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold tracking-tight">Product Attributes</CardTitle>
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-primary/5 text-primary border-primary/20">
                  Variants & Specs
                </Badge>
              </div>
              <CardDescription className="text-sm mt-1">
                Configure option dimensions (Colors, Sizes, Storage) for configurable product variants.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleOpenForm()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Attribute
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters & Stats Bar */}
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 pb-4 border-t border-border/50">
            {/* Search and Filters */}
            <div className="flex flex-1 items-center gap-3 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, or value..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm bg-background"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="button">Button Pills</SelectItem>
                  <SelectItem value="color">Color Swatches</SelectItem>
                  <SelectItem value="select">Dropdown Select</SelectItem>
                  <SelectItem value="radio">Radio List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Live Stats Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-lg border bg-muted/30 font-medium">
                Total: <span className="font-semibold text-foreground ml-1">{stats.total}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg border bg-muted/30 font-medium text-blue-600 dark:text-blue-400">
                Colors: <span className="font-semibold text-foreground ml-1">{stats.colors}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg border bg-muted/30 font-medium text-emerald-600 dark:text-emerald-400">
                Pills: <span className="font-semibold text-foreground ml-1">{stats.buttons}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg border bg-muted/30 font-medium">
                Total Values: <span className="font-semibold text-foreground ml-1">{stats.totalVals}</span>
              </div>
            </div>
          </div>

          {/* Attributes Table */}
          <div className="rounded-xl border border-border/80 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[220px]">Attribute</TableHead>
                  <TableHead className="w-[140px]">Display Type</TableHead>
                  <TableHead>Configured Values</TableHead>
                  <TableHead className="w-[100px] text-center">Required</TableHead>
                  <TableHead className="w-[90px] text-center">Status</TableHead>
                  <TableHead className="w-[80px] text-center">Order</TableHead>
                  <TableHead className="w-[70px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-sm">Loading attributes...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAttributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Layers className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium">No product attributes found</p>
                        <p className="text-xs text-muted-foreground/80">
                          {searchQuery ? "Try refining your search filter." : "Click 'Add Attribute' to create your first variant option."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttributes.map((attribute) => {
                    const isColor = attribute.displayType === "color";
                    return (
                      <TableRow key={attribute.id} className="hover:bg-muted/30 transition-colors">
                        {/* Name & Code */}
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{attribute.name}</span>
                              {attribute.isRequired && (
                                <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                                  Mandatory
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                              <span className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                                {attribute.code || attribute.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                              </span>
                            </div>
                            {attribute.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{attribute.description}</p>
                            )}
                          </div>
                        </TableCell>

                        {/* Display Type */}
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-card">
                            {isColor ? (
                              <>
                                <Palette className="h-3.5 w-3.5 text-indigo-500" />
                                <span>Color Swatch</span>
                              </>
                            ) : attribute.displayType === "select" ? (
                              <>
                                <ListFilter className="h-3.5 w-3.5 text-amber-500" />
                                <span>Dropdown</span>
                              </>
                            ) : attribute.displayType === "radio" ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Radio List</span>
                              </>
                            ) : (
                              <>
                                <Box className="h-3.5 w-3.5 text-sky-500" />
                                <span>Button Pill</span>
                              </>
                            )}
                          </div>
                        </TableCell>

                        {/* Configured Values */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5 max-w-xl">
                            {attribute.values.slice(0, 10).map((value) => {
                              const detail = attribute.valueDetails?.find((d) => d.value === value);
                              const hex = detail?.colorHex;
                              return (
                                <Badge
                                  key={value}
                                  variant="secondary"
                                  className="text-xs font-normal py-0.5 px-2 flex items-center gap-1.5 bg-secondary/60 hover:bg-secondary/80 border border-border/40"
                                >
                                  {isColor && hex && (
                                    <span
                                      className="inline-block w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                      style={{ backgroundColor: hex }}
                                    />
                                  )}
                                  <span>{value}</span>
                                </Badge>
                              );
                            })}
                            {attribute.values.length > 10 && (
                              <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">
                                +{attribute.values.length - 10} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Required Default */}
                        <TableCell className="text-center">
                          {attribute.isRequired ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px]">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Optional</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          {attribute.isActive !== false ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px]">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[11px]">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>

                        {/* Sort Order */}
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {attribute.order ?? 0}
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
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel className="text-xs">Attribute Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenForm(attribute)} className="cursor-pointer">
                                <Edit className="mr-2 h-3.5 w-3.5 text-primary" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive cursor-pointer focus:bg-destructive/10"
                                onClick={() => setAttributeToDelete(attribute)}
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Attribute
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/50 py-3">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredAttributes.length}</strong> of <strong>{attributes.length}</strong> attributes.
          </div>
        </CardFooter>
      </Card>

      {/* =========================================================================
          ADD / EDIT ATTRIBUTE MODAL DIALOG
      ========================================================================= */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl w-[95vw] h-[85vh] max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card gap-0">
          {/* PINNED DIALOG HEADER */}
          <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 shrink-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
                    {attributeToEdit ? "Edit Attribute" : "Add Attribute"}
                  </Badge>
                  {watchedCode && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                      code: {watchedCode}
                    </span>
                  )}
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {attributeToEdit ? `Edit Attribute: ${attributeToEdit.name}` : "Add New Attribute"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Define catalog option dimensions, preset values, visual storefront styling, and variant rules.
                </DialogDescription>
              </div>

              {/* Header Right Indicator */}
              <div className="hidden sm:flex items-center gap-2 sm:mr-8">
                <Badge variant="secondary" className="text-xs font-normal">
                  {valuesList.length} {valuesList.length === 1 ? "value" : "values"}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* FORM WRAPPER */}
          <form onSubmit={handleSubmit(handleSaveAttribute)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
              {/* PINNED TABS NAV */}
              <div className="px-6 pt-3.5 pb-2 border-b border-border/40 bg-card/60 shrink-0">
                <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-xl">
                  <TabsTrigger value="general" className="flex items-center gap-2 text-xs font-semibold py-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>General Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="values" className="flex items-center gap-2 text-xs font-semibold py-2">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Values & Options</span>
                    {valuesList.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-primary text-primary-foreground">
                        {valuesList.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="display" className="flex items-center gap-2 text-xs font-semibold py-2">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Display & Rules</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* SCROLLABLE DIALOG BODY */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 overscroll-contain modal-scrollbar space-y-6">
                {/* =========================================================================
                    TAB 1: GENERAL INFO
                ========================================================================= */}
                <TabsContent value="general" className="m-0 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Attribute Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="attr-name" className="text-xs font-semibold">
                        Attribute Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="attr-name"
                        placeholder="e.g. Color, Strap Size, Storage Capacity"
                        {...register("name")}
                        className="h-10 text-sm"
                      />
                      {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                      <p className="text-[11px] text-muted-foreground">The primary label shown to customers and store staff.</p>
                    </div>

                    {/* Attribute Code / Slug with lock */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="attr-code" className="text-xs font-semibold">
                          Attribute Code / Key <span className="text-destructive">*</span>
                        </Label>
                        <button
                          type="button"
                          onClick={() => setIsCodeLocked(!isCodeLocked)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isCodeLocked ? (
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
                          id="attr-code"
                          placeholder="e.g. color, strap-size, storage-capacity"
                          {...register("code")}
                          disabled={isCodeLocked}
                          className="h-10 text-sm font-mono"
                        />
                      </div>
                      {errors.code && <p className="text-destructive text-xs">{errors.code.message}</p>}
                      <p className="text-[11px] text-muted-foreground">Used internally in database, filters, and product variant matrix.</p>
                    </div>
                  </div>

                  {/* Display Visual Type Selector */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold">Storefront Display Styling</Label>
                    <Controller
                      name="displayType"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* 1. Button Pill */}
                          <div
                            onClick={() => field.onChange("button")}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                              field.value === "button"
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Box className={`h-5 w-5 ${field.value === "button" ? "text-primary" : "text-muted-foreground"}`} />
                              {field.value === "button" && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">Button Pills</div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">Best for Sizes (S, M), RAM, Storage (128GB).</p>
                            </div>
                          </div>

                          {/* 2. Color Swatches */}
                          <div
                            onClick={() => field.onChange("color")}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                              field.value === "color"
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Palette className={`h-5 w-5 ${field.value === "color" ? "text-primary" : "text-muted-foreground"}`} />
                              {field.value === "color" && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">Color Swatches</div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">Circular color circles with HEX color pickers.</p>
                            </div>
                          </div>

                          {/* 3. Dropdown Select */}
                          <div
                            onClick={() => field.onChange("select")}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                              field.value === "select"
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <ListFilter className={`h-5 w-5 ${field.value === "select" ? "text-primary" : "text-muted-foreground"}`} />
                              {field.value === "select" && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">Dropdown Select</div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">Compact dropdown menu for 6+ choices or long labels.</p>
                            </div>
                          </div>

                          {/* 4. Radio List */}
                          <div
                            onClick={() => field.onChange("radio")}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                              field.value === "radio"
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <CheckCircle2 className={`h-5 w-5 ${field.value === "radio" ? "text-primary" : "text-muted-foreground"}`} />
                              {field.value === "radio" && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">Radio List</div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">Vertical list with custom subtitle explanations.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  {/* Description / Instructions */}
                  <div className="space-y-1.5">
                    <Label htmlFor="attr-description" className="text-xs font-semibold">
                      Attribute Description & Customer Guidance (Optional)
                    </Label>
                    <Textarea
                      id="attr-description"
                      placeholder="e.g. Choose your preferred case finish and strap design for the smartwatch."
                      rows={3}
                      {...register("description")}
                      className="text-sm resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Shown to shoppers as a helper tooltip or info note next to the variant selector.
                    </p>
                  </div>
                </TabsContent>

                {/* =========================================================================
                    TAB 2: VALUES & OPTIONS
                ========================================================================= */}
                <TabsContent value="values" className="m-0 space-y-6">
                  {/* Quick Add Bar */}
                  <div className="p-4 rounded-xl border bg-card/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5 text-primary" />
                        Add New Value Option
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowBulkAdd(!showBulkAdd)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        {showBulkAdd ? "Hide Bulk Input" : "+ Paste Multiple Values (Bulk)"}
                      </button>
                    </div>

                    {/* Single Value Add Row */}
                    <div className="flex items-center gap-2">
                      {watchedDisplayType === "color" && (
                        <div className="flex items-center gap-1.5 border rounded-lg p-1 bg-muted/40 shrink-0">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                            title="Choose Color"
                          />
                          <span className="text-xs font-mono text-muted-foreground px-1">{newColorHex}</span>
                        </div>
                      )}

                      <Input
                        placeholder={
                          watchedDisplayType === "color"
                            ? "e.g. Midnight Black, Arctic White"
                            : "e.g. 128GB, Large, 44mm"
                        }
                        value={newValueInput}
                        onChange={(e) => setNewValueInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddValue();
                          }
                        }}
                        className="h-9 text-sm flex-1"
                      />

                      <Button
                        type="button"
                        onClick={handleAddValue}
                        size="sm"
                        className="h-9 px-4 bg-primary text-primary-foreground font-medium"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>

                    {/* Bulk Add Collapsible Box */}
                    {showBulkAdd && (
                      <div className="pt-2 border-t border-border/60 space-y-2">
                        <Label className="text-[11px] text-muted-foreground font-medium">
                          Paste comma or newline separated values (e.g. "64GB, 128GB, 256GB, 512GB"):
                        </Label>
                        <Textarea
                          placeholder="Red, Blue, Green, Yellow, Black, White..."
                          rows={2}
                          value={bulkInput}
                          onChange={(e) => setBulkInput(e.target.value)}
                          className="text-xs font-mono"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setShowBulkAdd(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                            onClick={handleBulkAdd}
                          >
                            Import Values
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Quick Presets Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-muted-foreground font-medium mr-1">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("colors")}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-muted/80 text-foreground transition-colors"
                      >
                        🎨 Colors
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("sizes")}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-muted/80 text-foreground transition-colors"
                      >
                        📏 Sizes (S-XXL)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("storage")}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-muted/80 text-foreground transition-colors"
                      >
                        💾 Storage (64GB-1TB)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("watchSizes")}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-muted/80 text-foreground transition-colors"
                      >
                        ⌚ Watch Dials
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("straps")}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-muted/80 text-foreground transition-colors"
                      >
                        🔗 Straps
                      </button>
                    </div>
                  </div>

                  {/* Configured Values List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-foreground">
                        Configured Values ({valuesList.length})
                      </Label>
                      {valuesList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setValuesList([]);
                            setColorDetails({});
                            setPreviewSelection("");
                          }}
                          className="text-[11px] text-destructive hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {valuesList.length === 0 ? (
                      <div className="p-8 rounded-xl border border-dashed border-border/80 text-center space-y-2 bg-muted/10">
                        <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                        <p className="text-sm font-medium text-foreground">No values added yet</p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Type a value above and press Enter, or click one of the quick presets to populate standard options.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto modal-scrollbar p-1">
                        {valuesList.map((val, idx) => {
                          const hex = colorDetails[val] || "#64748b";
                          return (
                            <div
                              key={val}
                              className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/20 transition-colors shadow-2xs group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Order actions */}
                                <div className="flex flex-col gap-0.5 text-muted-foreground shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveValue(idx, "up")}
                                    disabled={idx === 0}
                                    className="hover:text-foreground disabled:opacity-20"
                                    title="Move up"
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveValue(idx, "down")}
                                    disabled={idx === valuesList.length - 1}
                                    className="hover:text-foreground disabled:opacity-20"
                                    title="Move down"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </button>
                                </div>

                                {/* Color swatch picker if color type */}
                                {watchedDisplayType === "color" && (
                                  <div className="relative flex items-center shrink-0">
                                    <input
                                      type="color"
                                      value={hex}
                                      onChange={(e) => handleUpdateColorHex(val, e.target.value)}
                                      className="w-6 h-6 rounded-full border border-black/20 cursor-pointer overflow-hidden p-0"
                                      title={`Edit color for ${val}`}
                                    />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-foreground truncate">{val}</div>
                                  {watchedDisplayType === "color" && (
                                    <div className="text-[10px] font-mono text-muted-foreground">{hex}</div>
                                  )}
                                </div>
                              </div>

                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveValue(val)}
                                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                title="Remove value"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* LIVE STOREFRONT INTERACTIVE PREVIEW */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">Customer Storefront Live Preview</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-background text-primary border-primary/30">
                        Interactive
                      </Badge>
                    </div>

                    <div className="p-3.5 rounded-lg border bg-background space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>{watch("name") || "Select Attribute"}:</span>
                        <span className="text-primary font-bold">{previewSelection || "None selected"}</span>
                      </div>

                      {/* Preview based on Display Type */}
                      {valuesList.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Add values above to see live storefront preview.</p>
                      ) : watchedDisplayType === "color" ? (
                        /* Color Swatch Circles */
                        <div className="flex flex-wrap items-center gap-2">
                          {valuesList.map((val) => {
                            const isSelected = previewSelection === val;
                            const hex = colorDetails[val] || "#64748b";
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setPreviewSelection(val)}
                                className={`relative w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                                  isSelected
                                    ? "border-primary ring-2 ring-primary/30 scale-110 shadow-sm"
                                    : "border-border/60 hover:scale-105"
                                }`}
                                title={val}
                              >
                                <span
                                  className="block w-full h-full rounded-full border border-black/10"
                                  style={{ backgroundColor: hex }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      ) : watchedDisplayType === "select" ? (
                        /* Dropdown Preview */
                        <div className="max-w-xs">
                          <Select value={previewSelection} onValueChange={setPreviewSelection}>
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Choose option..." />
                            </SelectTrigger>
                            <SelectContent>
                              {valuesList.map((val) => (
                                <SelectItem key={val} value={val} className="text-xs">
                                  {val}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        /* Button Pills Preview */
                        <div className="flex flex-wrap items-center gap-2">
                          {valuesList.map((val) => {
                            const isSelected = previewSelection === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setPreviewSelection(val)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                                    : "border-border bg-card hover:bg-muted text-foreground"
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* =========================================================================
                    TAB 3: DISPLAY & RULES
                ========================================================================= */}
                <TabsContent value="display" className="m-0 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Active Status Switch */}
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-foreground">Active in Catalog</Label>
                        <p className="text-[11px] text-muted-foreground">
                          Allow this attribute to be selected in product forms and filter sidebars.
                        </p>
                      </div>
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                    </div>

                    {/* Required By Default Switch */}
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-foreground">Mandatory Selection</Label>
                        <p className="text-[11px] text-muted-foreground">
                          Customer must choose an option before adding the product to cart.
                        </p>
                      </div>
                      <Controller
                        name="isRequired"
                        control={control}
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                    </div>
                  </div>

                  {/* Display Sort Order */}
                  <div className="p-4 rounded-xl border bg-card space-y-2">
                    <Label htmlFor="attr-order" className="text-xs font-bold">
                      Catalog Display Sort Order
                    </Label>
                    <Input
                      id="attr-order"
                      type="number"
                      placeholder="0"
                      {...register("order")}
                      className="h-9 text-sm max-w-[180px]"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Lower numbers appear first on product detail pages (e.g. 1 for Color, 2 for Size).
                    </p>
                  </div>

                  {/* Guidance & Architecture Card */}
                  <div className="p-4 rounded-xl border bg-muted/30 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Info className="h-4 w-4 text-primary" />
                      How Attributes Connect to Products & Inventory
                    </div>
                    <p className="leading-relaxed">
                      Configuring attributes here makes them available in the <strong>Product Form (Tab 5: Variants & Attributes)</strong>.
                      When creating or editing a product, you can attach these attributes to generate specific stock-keeping units (SKUs),
                      pricing variations, and warehouse stock levels.
                    </p>
                  </div>
                </TabsContent>
              </div>

              {/* PINNED DIALOG FOOTER */}
              <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between sm:justify-between shrink-0">
                <div className="text-xs text-muted-foreground">
                  {attributeToEdit ? (
                    <span className="font-mono bg-muted px-2 py-0.5 rounded border border-border/50">
                      ID: {attributeToEdit.id}
                    </span>
                  ) : (
                    <span>Ready to create new attribute</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseForm}
                    disabled={isSubmitting}
                    className="h-9 px-4 text-xs font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : attributeToEdit ? (
                      "Save Changes"
                    ) : (
                      "Create Attribute"
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
      <AlertDialog open={!!attributeToDelete} onOpenChange={(open) => !open && setAttributeToDelete(null)}>
        <AlertDialogContent className="rounded-xl border border-border/80 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Delete Product Attribute?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently remove the attribute{" "}
              <strong>"{attributeToDelete?.name}"</strong> and its associated preset values from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAttribute}
              className="h-9 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Attribute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
