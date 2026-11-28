"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Papa from "papaparse";
import {
  type Product,
  type Category,
  type Brand,
  products as defaultProducts,
  categories as defaultCategories,
  brands as defaultBrands,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Download,
  FileUp,
  FileDown,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Check,
  X,
  Info,
  ExternalLink,
  Eye,
  ArrowRight,
  Database,
  HelpCircle,
} from "lucide-react";

interface ParsedProductRow {
  [key: string]: any;
}

export default function BulkImportExportPage() {
  const { toast } = useToast();

  // Active Main Page Tab
  const [activeMainTab, setActiveMainTab] = useState("import");

  // Catalog Database Cache
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // =========================================================================
  // IMPORT STATE
  // =========================================================================
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState<{ imported: number; updated: number; failed: number }>({
    imported: 0,
    updated: 0,
    failed: 0,
  });
  const [previewSearch, setPreviewSearch] = useState("");
  const [duplicateHandling, setDuplicateHandling] = useState<"update" | "skip" | "create">("update");
  const [fallbackCategory, setFallbackCategory] = useState("Wearables");
  const [fallbackBrand, setFallbackBrand] = useState("Generic");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [modalImportStep, setModalImportStep] = useState<"upload" | "preview" | "options">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // EXPORT STATE
  // =========================================================================
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Selected columns to export
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>({
    name: true,
    permalink: true,
    sku: true,
    price: true,
    originalPrice: true,
    stock: true,
    manageStock: true,
    categories: true,
    brand: true,
    supplier: true,
    productType: true,
    warranty: true,
    description: true,
    images: true,
    features: true,
    specifications: true,
    productAttributes: true,
  });

  // Fetch products, categories, and brands
  useEffect(() => {
    const loadCatalogData = async () => {
      setIsLoadingCatalog(true);
      try {
        const [prodRes, catRes, brandRes] = await Promise.allSettled([
          fetch("/api/data/products").then((r) => r.json()),
          fetch("/api/data/categories").then((r) => r.json()),
          fetch("/api/data/brands").then((r) => r.json()),
        ]);

        if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value) && prodRes.value.length > 0) {
          setCatalogProducts(prodRes.value);
        } else {
          setCatalogProducts(defaultProducts);
        }

        if (catRes.status === "fulfilled" && Array.isArray(catRes.value) && catRes.value.length > 0) {
          setCategoriesList(catRes.value);
        } else {
          setCategoriesList(defaultCategories.map((c) => ({ ...c, id: c.permalink })));
        }

        if (brandRes.status === "fulfilled" && Array.isArray(brandRes.value) && brandRes.value.length > 0) {
          setBrandsList(brandRes.value);
        } else {
          setBrandsList(defaultBrands.map((b) => ({ ...b, id: b.permalink })));
        }
      } catch {
        setCatalogProducts(defaultProducts);
        setCategoriesList(defaultCategories.map((c) => ({ ...c, id: c.permalink })));
        setBrandsList(defaultBrands.map((b) => ({ ...b, id: b.permalink })));
      } finally {
        setIsLoadingCatalog(false);
      }
    };

    loadCatalogData();
  }, []);

  // =========================================================================
  // FILE PARSING LOGIC (CSV & JSON)
  // =========================================================================
  const handleFileSelection = (selectedFile: File) => {
    const isCsv = selectedFile.name.endsWith(".csv") || selectedFile.type === "text/csv";
    const isJson = selectedFile.name.endsWith(".json") || selectedFile.type === "application/json";

    if (!isCsv && !isJson) {
      toast({
        variant: "destructive",
        title: "Unsupported File Format",
        description: "Please upload a valid .csv spreadsheet or .json catalog file.",
      });
      return;
    }

    setImportFile(selectedFile);
    setIsParsing(true);
    setParsedRows([]);
    setHeaders([]);

    if (isJson) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          const array = Array.isArray(content) ? content : content.products || [];
          if (array.length === 0) {
            toast({
              variant: "destructive",
              title: "Empty JSON",
              description: "The JSON file does not contain an array of products.",
            });
            setIsParsing(false);
            return;
          }
          const keys = Object.keys(array[0] || {});
          setHeaders(keys);
          setParsedRows(array);
          setIsParsing(false);
          toast({
            title: "JSON Parsed",
            description: `Loaded ${array.length} products from ${selectedFile.name}.`,
          });
        } catch {
          toast({
            variant: "destructive",
            title: "Invalid JSON",
            description: "Could not parse JSON file. Please verify syntax.",
          });
          setIsParsing(false);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      // Parse CSV via PapaParse
      Papa.parse<ParsedProductRow>(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0 && results.data.length === 0) {
            toast({
              variant: "destructive",
              title: "CSV Parsing Error",
              description: results.errors[0]?.message || "Check CSV formatting.",
            });
            setIsParsing(false);
            return;
          }
          setHeaders(results.meta.fields || []);
          setParsedRows(results.data);
          setIsParsing(false);
          toast({
            title: "CSV Parsed",
            description: `Loaded ${results.data.length} products from ${selectedFile.name}.`,
          });
        },
        error: (err) => {
          toast({
            variant: "destructive",
            title: "Parsing Error",
            description: err.message,
          });
          setIsParsing(false);
        },
      });
    }
  };

  // Row validation helper
  const validatedRows = useMemo(() => {
    return parsedRows.map((row, idx) => {
      const name = String(row.name || "").trim();
      const rawPrice = row.price;
      const price = Number(rawPrice);
      const isPriceValid = !isNaN(price) && price >= 0;
      const hasName = name.length > 0;

      let status: "valid" | "warning" | "error" = "valid";
      const issues: string[] = [];

      if (!hasName) {
        status = "error";
        issues.push("Missing product name");
      }
      if (!isPriceValid) {
        status = "error";
        issues.push("Invalid price");
      }
      if (!row.sku) {
        issues.push("Missing SKU (will auto-generate)");
        if (status === "valid") status = "warning";
      }

      return {
        rowNumber: idx + 1,
        data: row,
        name,
        price: isPriceValid ? price : 0,
        sku: row.sku || `SKU-AUTO-${idx + 1}`,
        category: row.category || row.categories || fallbackCategory,
        brand: row.brand || fallbackBrand,
        stock: Number(row.stock) || 0,
        productType: row.productType === "Digital" ? "Digital" : "Physical",
        status,
        issues,
      };
    });
  }, [parsedRows, fallbackCategory, fallbackBrand]);

  // Filtered preview rows
  const filteredPreviewRows = useMemo(() => {
    if (!previewSearch.trim()) return validatedRows;
    const term = previewSearch.toLowerCase();
    return validatedRows.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.sku.toLowerCase().includes(term) ||
        String(r.category).toLowerCase().includes(term) ||
        String(r.brand).toLowerCase().includes(term)
    );
  }, [validatedRows, previewSearch]);

  // Validation Summary Stats
  const validationStats = useMemo(() => {
    const total = validatedRows.length;
    const valid = validatedRows.filter((r) => r.status === "valid").length;
    const warning = validatedRows.filter((r) => r.status === "warning").length;
    const error = validatedRows.filter((r) => r.status === "error").length;
    return { total, valid, warning, error };
  }, [validatedRows]);

  // =========================================================================
  // EXECUTE BULK IMPORT
  // =========================================================================
  const handleExecuteImport = async () => {
    if (validatedRows.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    let importedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    const validItems = validatedRows.filter((r) => r.status !== "error");
    const totalToProcess = validItems.length;

    try {
      for (let i = 0; i < totalToProcess; i++) {
        const item = validItems[i];
        const row = item.data;

        const permalink = (row.permalink || row.name)
          .toLowerCase()
          .trim()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

        let specifications: Record<string, string> = {};
        if (typeof row.specifications === "object" && row.specifications !== null) {
          specifications = row.specifications;
        } else if (typeof row.specifications === "string") {
          try {
            specifications = JSON.parse(row.specifications);
          } catch { }
        }

        let productAttributes: any[] = [];
        if (Array.isArray(row.productAttributes)) {
          productAttributes = row.productAttributes;
        } else if (typeof row.productAttributes === "string") {
          try {
            productAttributes = JSON.parse(row.productAttributes);
          } catch { }
        }

        const categoriesArray = Array.isArray(row.categories)
          ? row.categories
          : typeof row.categories === "string" && row.categories
            ? row.categories.split(",").map((s: string) => s.trim()).filter(Boolean)
            : row.category
              ? [row.category]
              : [fallbackCategory];

        const payload = {
          name: item.name,
          permalink,
          description: row.description || "",
          price: item.price,
          originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
          categories: categoriesArray,
          brand: row.brand || fallbackBrand,
          sku: item.sku,
          stock: item.stock,
          manageStock: row.manageStock !== false && row.manageStock !== "false",
          supplier: row.supplier || "Default Supplier",
          warranty: row.warranty || "",
          productType: item.productType,
          downloadUrl: row.downloadUrl || "",
          digitalProductNote: row.digitalProductNote || "",
          images: Array.isArray(row.images)
            ? row.images
            : typeof row.images === "string" && row.images
              ? row.images.split(",").map((s: string) => s.trim()).filter(Boolean)
              : ["https://placehold.co/600x600.png"],
          features: Array.isArray(row.features)
            ? row.features
            : typeof row.features === "string" && row.features
              ? row.features.split(";").map((s: string) => s.trim()).filter(Boolean)
              : [],
          specifications,
          productAttributes,
          rating: Number(row.rating) || 0,
          reviewCount: Number(row.reviewCount) || 0,
          createdAt: new Date().toISOString(),
        };

        // Check if product with matching SKU or permalink exists
        const existing = catalogProducts.find(
          (p) => (p.sku && p.sku === item.sku) || p.permalink === permalink
        );

        if (existing && duplicateHandling === "skip") {
          // Skip
          continue;
        }

        if (existing && duplicateHandling === "update") {
          const res = await fetch(`/api/data/products/${existing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) updatedCount++;
          else failedCount++;
        } else {
          const res = await fetch("/api/data/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) importedCount++;
          else failedCount++;
        }

        setImportProgress(Math.round(((i + 1) / totalToProcess) * 100));
      }

      setImportStats({
        imported: importedCount,
        updated: updatedCount,
        failed: failedCount,
      });

      toast({
        title: "Bulk Import Finished",
        description: `Successfully processed: ${importedCount} created, ${updatedCount} updated, ${failedCount} errors.`,
      });

      // Refresh catalog list
      fetch("/api/data/products")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setCatalogProducts(data);
        })
        .catch(() => { });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Import Error",
        description: "An unexpected error occurred during batch import.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // =========================================================================
  // EXPORT FILTERING & DOWNLOAD LOGIC
  // =========================================================================
  const filteredExportProducts = useMemo(() => {
    return catalogProducts.filter((p) => {
      const matchCat =
        categoryFilter === "all" ||
        (Array.isArray(p.categories) && p.categories.includes(categoryFilter));

      const matchBrand =
        brandFilter === "all" ||
        (p.brand && p.brand.toLowerCase() === brandFilter.toLowerCase());

      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && (p.stock || 0) > 0) ||
        (stockFilter === "low_stock" && (p.stock || 0) > 0 && (p.stock || 0) <= 10) ||
        (stockFilter === "out_of_stock" && (!p.stock || p.stock <= 0));

      const matchType =
        typeFilter === "all" ||
        (p.productType || "Physical").toLowerCase() === typeFilter.toLowerCase();

      return matchCat && matchBrand && matchStock && matchType;
    });
  }, [catalogProducts, categoryFilter, brandFilter, stockFilter, typeFilter]);

  const handleExecuteExport = () => {
    if (filteredExportProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Products to Export",
        description: "No catalog products matched your current export filter criteria.",
      });
      return;
    }

    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().split("T")[0];

      if (exportFormat === "json") {
        // Export as formatted JSON
        const exportData = filteredExportProducts.map((p) => {
          const item: Record<string, any> = {};
          Object.keys(selectedColumns).forEach((col) => {
            if (selectedColumns[col]) {
              item[col] = (p as any)[col];
            }
          });
          return item;
        });

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `emotionview-products-${dateStr}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Export as CSV via PapaParse
        const exportData = filteredExportProducts.map((p) => {
          const item: Record<string, any> = {};
          Object.keys(selectedColumns).forEach((col) => {
            if (selectedColumns[col]) {
              const val = (p as any)[col];
              if (Array.isArray(val)) {
                item[col] = val.join(", ");
              } else if (typeof val === "object" && val !== null) {
                item[col] = JSON.stringify(val);
              } else {
                item[col] = val ?? "";
              }
            }
          });
          return item;
        });

        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `emotionview-products-${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Complete",
        description: `Exported ${filteredExportProducts.length} products to ${exportFormat.toUpperCase()}.`,
      });
      setIsExportModalOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An error occurred while generating the catalog export file.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Download Sample JSON
  const handleDownloadSampleJson = () => {
    const sampleJson = [
      {
        name: "Haylou Solar Plus RT3 Smartwatch",
        permalink: "haylou-solar-plus-rt3-smartwatch",
        description: "1.43-inch AMOLED display with Bluetooth calling and 105 sport modes.",
        price: 55,
        originalPrice: 65,
        categories: ["Wearables"],
        brand: "Haylou",
        sku: "HL-RT3-BLK",
        stock: 45,
        manageStock: true,
        supplier: "Haylou Official",
        warranty: "1 Year Brand Warranty",
        productType: "Physical",
        images: ["https://placehold.co/600x600.png"],
        features: ["AMOLED Display", "Bluetooth Phone Call", "Stress & Mood Monitoring"],
        specifications: { Display: "1.43 AMOLED", Battery: "280mAh", Waterproof: "IP68" },
      },
    ];

    const blob = new Blob([JSON.stringify(sampleJson, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample-products-template.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PAGE HEADER
      ========================================================================= */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Catalog Import & Export
                </CardTitle>
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-primary/5 text-primary border-primary/20">
                  Data Pipeline
                </Badge>
              </div>
              <CardDescription className="text-sm mt-1">
                Batch import products from CSV/JSON spreadsheets or export filtered catalog records for backups and reporting.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                onClick={() => setIsExportModalOpen(true)}
                className="h-9 text-xs font-semibold border-border hover:bg-muted"
              >
                <FileDown className="mr-2 h-4 w-4 text-primary" />
                Bulk Export Modal
              </Button>
              <Button
                onClick={() => {
                  setModalImportStep("upload");
                  setIsImportModalOpen(true);
                }}
                className="h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                <FileUp className="mr-2 h-4 w-4" />
                Bulk Import Modal
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* TABS CONTROLLER */}
        <CardContent className="pt-0">
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-lg bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="import" className="flex items-center gap-2 text-xs font-semibold py-2">
                <Upload className="h-3.5 w-3.5" />
                <span>Bulk Import</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2 text-xs font-semibold py-2">
                <Download className="h-3.5 w-3.5" />
                <span>Bulk Export</span>
              </TabsTrigger>
              <TabsTrigger value="schema" className="flex items-center gap-2 text-xs font-semibold py-2">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Format Guide</span>
              </TabsTrigger>
            </TabsList>

            {/* =========================================================================
                TAB 1: BULK IMPORT (MAIN CANVAS)
            ========================================================================= */}
            <TabsContent value="import" className="space-y-6 m-0">
              {/* Step 1: Upload Zone Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dropped = e.dataTransfer.files?.[0];
                      if (dropped) handleFileSelection(dropped);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl text-center cursor-pointer transition-all bg-card/60 hover:bg-muted/10 group space-y-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, .json, text/csv, application/json"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileSelection(f);
                      }}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="h-7 w-7" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground">
                        {importFile ? importFile.name : "Click to browse or drop catalog file here"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Supports standard comma-separated <strong>.CSV</strong> and structured <strong>.JSON</strong> datasets.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <Badge variant="secondary" className="text-[11px] font-mono">Max 10MB</Badge>
                      <Badge variant="secondary" className="text-[11px] font-mono">UTF-8 Encoded</Badge>
                    </div>
                  </div>

                  {/* Template Downloads */}
                  <div className="flex flex-wrap items-center justify-between p-4 rounded-xl border bg-muted/20 gap-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-foreground">Need standard import templates?</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs font-medium">
                        <Link href="/sample-products.csv" download>
                          <FileDown className="mr-1.5 h-3.5 w-3.5" />
                          Sample CSV
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadSampleJson}
                        className="h-8 text-xs font-medium"
                      >
                        <FileCode className="mr-1.5 h-3.5 w-3.5" />
                        Sample JSON
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Import Configuration Panel */}
                <div className="p-5 rounded-2xl border bg-card space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <h4 className="text-xs font-bold text-foreground">Import Configuration</h4>
                  </div>

                  {/* Duplicate Handling */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Duplicate Products (SKU / Slug)</Label>
                    <Select
                      value={duplicateHandling}
                      onValueChange={(val: any) => setDuplicateHandling(val)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="update">Update existing matched products</SelectItem>
                        <SelectItem value="skip">Skip duplicates (keep store records)</SelectItem>
                        <SelectItem value="create">Always create as new items</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Matches records by unique SKU code or URL permalink.
                    </p>
                  </div>

                  {/* Default Category Fallback */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Fallback Category</Label>
                    <Select value={fallbackCategory} onValueChange={setFallbackCategory}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesList.map((c) => (
                          <SelectItem key={c.id} value={c.name} className="text-xs">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Default Brand Fallback */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Fallback Brand</Label>
                    <Select value={fallbackBrand} onValueChange={setFallbackBrand}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Generic">Generic / OEM</SelectItem>
                        {brandsList.map((b) => (
                          <SelectItem key={b.id} value={b.name} className="text-xs">
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Step 2: Parsing & Validation Summary */}
              {isParsing && (
                <div className="flex items-center justify-center p-12 rounded-2xl border bg-muted/10">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm font-medium">Parsing and validating catalog dataset...</span>
                  </div>
                </div>
              )}

              {parsedRows.length > 0 && (
                <div className="space-y-4">
                  {/* Validation Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border bg-card">
                      <div className="text-xs text-muted-foreground">Total Rows</div>
                      <div className="text-xl font-bold text-foreground mt-0.5">{validationStats.total}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30">
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Ready to Import</div>
                      <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{validationStats.valid}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/30">
                      <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">Warnings (Auto-fixed)</div>
                      <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">{validationStats.warning}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-red-50/50 dark:bg-red-950/20 border-red-500/30">
                      <div className="text-xs text-destructive font-medium">Invalid / Skipped</div>
                      <div className="text-xl font-bold text-destructive mt-0.5">{validationStats.error}</div>
                    </div>
                  </div>

                  {/* Preview Table Card */}
                  <Card className="border border-border/80 overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold">Import Dataset Preview</CardTitle>
                        <CardDescription className="text-xs">
                          Showing first {Math.min(filteredPreviewRows.length, 10)} of {filteredPreviewRows.length} parsed records.
                        </CardDescription>
                      </div>

                      <div className="w-64">
                        <Input
                          placeholder="Filter preview items..."
                          value={previewSearch}
                          onChange={(e) => setPreviewSearch(e.target.value)}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <div className="max-h-[360px] overflow-y-auto modal-scrollbar">
                        <Table>
                          <TableHeader className="bg-muted/40 sticky top-0 z-10">
                            <TableRow>
                              <TableHead className="w-12 text-center">#</TableHead>
                              <TableHead className="min-w-[200px]">Product Name</TableHead>
                              <TableHead className="w-[120px]">SKU</TableHead>
                              <TableHead className="w-[90px]">Price</TableHead>
                              <TableHead className="w-[130px]">Category</TableHead>
                              <TableHead className="w-[110px]">Brand</TableHead>
                              <TableHead className="w-[80px] text-center">Stock</TableHead>
                              <TableHead className="w-[110px] text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPreviewRows.slice(0, 15).map((row) => (
                              <TableRow key={row.rowNumber} className="hover:bg-muted/20">
                                <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                  {row.rowNumber}
                                </TableCell>
                                <TableCell>
                                  <div className="font-semibold text-xs text-foreground truncate max-w-[240px]">
                                    {row.name || "<Unnamed Product>"}
                                  </div>
                                  {row.issues.length > 0 && (
                                    <div className="text-[10px] text-amber-600 dark:text-amber-400 truncate">
                                      {row.issues.join(", ")}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground truncate">
                                  {row.sku}
                                </TableCell>
                                <TableCell className="font-semibold text-xs text-foreground">
                                  ৳{row.price}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground truncate">
                                  {String(row.category)}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground truncate">
                                  {String(row.brand)}
                                </TableCell>
                                <TableCell className="text-center font-mono text-xs">
                                  {row.stock}
                                </TableCell>
                                <TableCell className="text-center">
                                  {row.status === "valid" ? (
                                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                                      Ready
                                    </Badge>
                                  ) : row.status === "warning" ? (
                                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                                      Warning
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="text-[10px]">
                                      Error
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>

                    {/* Execution Bar */}
                    <CardFooter className="py-3 px-4 border-t bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 w-full max-w-md space-y-1">
                        {isImporting ? (
                          <>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Importing products into database...</span>
                              <span className="font-bold text-foreground">{importProgress}%</span>
                            </div>
                            <Progress value={importProgress} className="h-2" />
                          </>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            Ready to import <strong>{validationStats.valid + validationStats.warning}</strong> valid products.
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setImportFile(null);
                            setParsedRows([]);
                          }}
                          disabled={isImporting}
                          className="h-9 text-xs"
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleExecuteImport}
                          disabled={isImporting || validationStats.valid + validationStats.warning === 0}
                          className="h-9 px-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Importing ({importProgress}%)...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Start Bulk Import
                            </>
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* =========================================================================
                TAB 2: BULK EXPORT (MAIN CANVAS)
            ========================================================================= */}
            <TabsContent value="export" className="space-y-6 m-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Format and Filters */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Format Selection Cards */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold">1. Select Export Format</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setExportFormat("csv")}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${exportFormat === "csv"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">CSV Spreadsheet (.csv)</div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Compatible with Microsoft Excel, Google Sheets, and re-importing.
                            </p>
                          </div>
                        </div>
                        {exportFormat === "csv" && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </div>

                      <div
                        onClick={() => setExportFormat("json")}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${exportFormat === "json"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                            <FileCode className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">JSON Full Catalog (.json)</div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Complete nested backup with full specifications and variants.
                            </p>
                          </div>
                        </div>
                        {exportFormat === "json" && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                    </div>
                  </div>

                  {/* Filter Criteria */}
                  <div className="p-5 rounded-2xl border bg-card space-y-4 shadow-xs">
                    <Label className="text-xs font-bold">2. Filter Export Scope</Label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Category Filter</Label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories ({catalogProducts.length})</SelectItem>
                            {categoriesList.map((c) => (
                              <SelectItem key={c.id} value={c.name} className="text-xs">
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Brand */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Brand Filter</Label>
                        <Select value={brandFilter} onValueChange={setBrandFilter}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="All Brands" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            {brandsList.map((b) => (
                              <SelectItem key={b.id} value={b.name} className="text-xs">
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Stock Status */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Stock Status</Label>
                        <Select value={stockFilter} onValueChange={setStockFilter}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="All Stock Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Inventory</SelectItem>
                            <SelectItem value="in_stock">In Stock Only (&gt; 0)</SelectItem>
                            <SelectItem value="low_stock">Low Stock (1 - 10)</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock (0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Product Type */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Product Type</Label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="All Product Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Physical & Digital</SelectItem>
                            <SelectItem value="physical">Physical Goods Only</SelectItem>
                            <SelectItem value="digital">Digital Downloads Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column Checklist & Action */}
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl border bg-card space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <Label className="text-xs font-bold">3. Select Columns</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const allSelected = Object.values(selectedColumns).every(Boolean);
                          const next: Record<string, boolean> = {};
                          Object.keys(selectedColumns).forEach((k) => {
                            next[k] = !allSelected;
                          });
                          setSelectedColumns(next);
                        }}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        Toggle All
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[260px] overflow-y-auto modal-scrollbar pr-1">
                      {Object.keys(selectedColumns).map((col) => (
                        <div key={col} className="flex items-center space-x-2 text-xs">
                          <Checkbox
                            id={`col-${col}`}
                            checked={selectedColumns[col]}
                            onCheckedChange={(checked) =>
                              setSelectedColumns((prev) => ({ ...prev, [col]: !!checked }))
                            }
                          />
                          <Label htmlFor={`col-${col}`} className="text-xs cursor-pointer capitalize font-mono text-muted-foreground hover:text-foreground">
                            {col}
                          </Label>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Matching Records:</span>
                        <Badge variant="secondary" className="font-mono">
                          {filteredExportProducts.length} of {catalogProducts.length}
                        </Badge>
                      </div>

                      <Button
                        onClick={handleExecuteExport}
                        disabled={isExporting || filteredExportProducts.length === 0}
                        className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Export...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Export {filteredExportProducts.length} Products ({exportFormat.toUpperCase()})
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* =========================================================================
                TAB 3: SCHEMA & COLUMN GUIDE
            ========================================================================= */}
            <TabsContent value="schema" className="space-y-5 m-0">
              <Card className="border border-border/80">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Catalog Column Reference</CardTitle>
                  <CardDescription className="text-xs">
                    Use these column headers when preparing your CSV or JSON spreadsheet for seamless automated imports.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-[180px]">Column Header</TableHead>
                        <TableHead className="w-[120px]">Required</TableHead>
                        <TableHead className="w-[140px]">Data Type</TableHead>
                        <TableHead>Description & Format Notes</TableHead>
                        <TableHead className="w-[200px]">Example</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs font-bold text-foreground">name</TableCell>
                        <TableCell><Badge variant="destructive" className="text-[10px]">Required</Badge></TableCell>
                        <TableCell className="text-xs font-mono">string</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Product title as displayed on storefront.</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">KOSPET TANK T2</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs font-bold text-foreground">price</TableCell>
                        <TableCell><Badge variant="destructive" className="text-[10px]">Required</Badge></TableCell>
                        <TableCell className="text-xs font-mono">number</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Selling price in BDT currency.</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">129.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs font-bold text-foreground">sku</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px]">Recommended</Badge></TableCell>
                        <TableCell className="text-xs font-mono">string</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Unique Stock Keeping Unit code.</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">KP-TK2-BLK</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs font-bold text-foreground">categories</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">Optional</Badge></TableCell>
                        <TableCell className="text-xs font-mono">comma list</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Comma-separated category names.</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">Wearables, Smart Watches</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs font-bold text-foreground">brand</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">Optional</Badge></TableCell>
                        <TableCell className="text-xs font-mono">string</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Brand name matching registered brand.</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">KOSPET</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs font-bold text-foreground">stock</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">Optional</Badge></TableCell>
                        <TableCell className="text-xs font-mono">number</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Initial warehouse inventory quantity.</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">50</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs font-bold text-foreground">features</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">Optional</Badge></TableCell>
                        <TableCell className="text-xs font-mono">semicolon list</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Bullet highlights separated by semicolons (;).</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">AMOLED; 5ATM Waterproof</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs font-bold text-foreground">images</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">Optional</Badge></TableCell>
                        <TableCell className="text-xs font-mono">comma URLs</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Direct image links separated by commas.</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">https://...img1.png, https://...</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* =========================================================================
          DEDICATED BULK IMPORT DIALOG MODAL
      ========================================================================= */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl w-[95vw] h-[85vh] max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 shrink-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
                    Catalog Batch Pipeline
                  </Badge>
                  {importFile && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {importFile.name}
                    </span>
                  )}
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight">Bulk Import Products</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Step-by-step catalog ingestion from CSV spreadsheet or JSON backup files.
                </DialogDescription>
              </div>

              {parsedRows.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 sm:mr-8">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {parsedRows.length} items loaded
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* MODAL TABS / STEPS */}
          <div className="px-6 pt-3.5 pb-2 border-b border-border/40 bg-card/60 shrink-0">
            <div className="grid grid-cols-3 gap-2 bg-muted/60 p-1 rounded-xl text-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalImportStep("upload")}
                className={`py-1.5 rounded-lg transition-all ${modalImportStep === "upload" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                1. Upload File
              </button>
              <button
                type="button"
                onClick={() => parsedRows.length > 0 && setModalImportStep("preview")}
                disabled={parsedRows.length === 0}
                className={`py-1.5 rounded-lg transition-all disabled:opacity-40 ${modalImportStep === "preview" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                2. Preview & Validation
              </button>
              <button
                type="button"
                onClick={() => parsedRows.length > 0 && setModalImportStep("options")}
                disabled={parsedRows.length === 0}
                className={`py-1.5 rounded-lg transition-all disabled:opacity-40 ${modalImportStep === "options" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                3. Rules & Execution
              </button>
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 overscroll-contain modal-scrollbar space-y-6">
            {modalImportStep === "upload" && (
              <div className="space-y-5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl text-center cursor-pointer transition-all bg-card/60 hover:bg-muted/10 group space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">
                      {importFile ? importFile.name : "Select or drag .CSV / .JSON product file"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      UTF-8 encoded files with columns matching standard headers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 text-xs">
                  <span className="font-semibold text-foreground">Download pre-formatted templates:</span>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                      <Link href="/sample-products.csv" download>
                        Sample CSV
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadSampleJson} className="h-7 text-xs">
                      Sample JSON
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {modalImportStep === "preview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl border bg-card">
                    <div className="text-muted-foreground">Total Rows</div>
                    <div className="text-lg font-bold text-foreground">{validationStats.total}</div>
                  </div>
                  <div className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600">
                    <div>Valid</div>
                    <div className="text-lg font-bold">{validationStats.valid + validationStats.warning}</div>
                  </div>
                  <div className="p-3 rounded-xl border bg-red-50/50 dark:bg-red-950/20 text-destructive">
                    <div>Errors</div>
                    <div className="text-lg font-bold">{validationStats.error}</div>
                  </div>
                </div>

                <div className="rounded-xl border overflow-hidden max-h-[300px] overflow-y-auto modal-scrollbar">
                  <Table>
                    <TableHeader className="bg-muted/40 sticky top-0">
                      <TableRow>
                        <TableHead className="w-10 text-center">#</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validatedRows.slice(0, 10).map((r) => (
                        <TableRow key={r.rowNumber} className="text-xs">
                          <TableCell className="text-center font-mono text-muted-foreground">{r.rowNumber}</TableCell>
                          <TableCell className="font-semibold truncate max-w-[200px]">{r.name}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">{r.sku}</TableCell>
                          <TableCell className="font-semibold">৳{r.price}</TableCell>
                          <TableCell className="text-muted-foreground">{String(r.category)}</TableCell>
                          <TableCell className="text-center">
                            {r.status === "valid" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 text-[10px]">Valid</Badge>
                            ) : r.status === "warning" ? (
                              <Badge className="bg-amber-500/15 text-amber-600 text-[10px]">Warning</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">Error</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {modalImportStep === "options" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-card space-y-3">
                  <Label className="text-xs font-bold">Duplicate SKU / Permalink Policy</Label>
                  <Select value={duplicateHandling} onValueChange={(v: any) => setDuplicateHandling(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update">Update existing matched products</SelectItem>
                      <SelectItem value="skip">Skip duplicates (do not overwrite)</SelectItem>
                      <SelectItem value="create">Always create as separate products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-xl border bg-card space-y-3">
                  <Label className="text-xs font-bold">Default Category</Label>
                  <Select value={fallbackCategory} onValueChange={setFallbackCategory}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesList.map((c) => (
                        <SelectItem key={c.id} value={c.name} className="text-xs">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isImporting && (
                  <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Importing records...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PINNED MODAL FOOTER */}
          <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between sm:justify-between shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsImportModalOpen(false)}
              disabled={isImporting}
              className="h-9 text-xs"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              {modalImportStep === "upload" && parsedRows.length > 0 && (
                <Button
                  type="button"
                  onClick={() => setModalImportStep("preview")}
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Continue to Preview <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}

              {modalImportStep === "preview" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalImportStep("upload")}
                    className="h-9 text-xs"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setModalImportStep("options")}
                    className="h-9 px-4 text-xs font-semibold"
                  >
                    Set Rules & Import <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </>
              )}

              {modalImportStep === "options" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalImportStep("preview")}
                    disabled={isImporting}
                    className="h-9 text-xs"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={isImporting}
                    className="h-9 px-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      "Execute Import"
                    )}
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DEDICATED BULK EXPORT DIALOG MODAL
      ========================================================================= */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl w-[95vw] h-[85vh] max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 shrink-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
                    Catalog Export Pipeline
                  </Badge>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Format: {exportFormat.toUpperCase()}
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight">Bulk Export Products</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Download catalog data in CSV or JSON with custom category and inventory filtering.
                </DialogDescription>
              </div>

              <div className="hidden sm:flex items-center gap-2 sm:mr-8">
                <Badge variant="secondary" className="text-xs font-normal">
                  {filteredExportProducts.length} items matched
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* SCROLLABLE EXPORT BODY */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 overscroll-contain modal-scrollbar space-y-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">Export Format</Label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setExportFormat("csv")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${exportFormat === "csv"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-foreground">CSV Spreadsheet</div>
                      <div className="text-[10px] text-muted-foreground">For Excel & Google Sheets</div>
                    </div>
                  </div>
                  {exportFormat === "csv" && <Check className="h-4 w-4 text-primary" />}
                </div>

                <div
                  onClick={() => setExportFormat("json")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${exportFormat === "json"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-border/80 bg-card hover:bg-muted/20"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCode className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-foreground">JSON Full Backup</div>
                      <div className="text-[10px] text-muted-foreground">Nested specs & variants</div>
                    </div>
                  </div>
                  {exportFormat === "json" && <Check className="h-4 w-4 text-primary" />}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 rounded-xl border bg-card space-y-4">
              <Label className="text-xs font-bold">Catalog Filters</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoriesList.map((c) => (
                        <SelectItem key={c.id} value={c.name} className="text-xs">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Brand</Label>
                  <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brandsList.map((b) => (
                        <SelectItem key={b.id} value={b.name} className="text-xs">
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Columns Checklist */}
            <div className="p-4 rounded-xl border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold">Included Fields</Label>
                <span className="text-[11px] text-muted-foreground">
                  {Object.values(selectedColumns).filter(Boolean).length} of {Object.keys(selectedColumns).length} selected
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.keys(selectedColumns).map((col) => (
                  <div key={col} className="flex items-center space-x-2 text-xs">
                    <Checkbox
                      id={`modal-col-${col}`}
                      checked={selectedColumns[col]}
                      onCheckedChange={(checked) =>
                        setSelectedColumns((prev) => ({ ...prev, [col]: !!checked }))
                      }
                    />
                    <Label htmlFor={`modal-col-${col}`} className="text-xs cursor-pointer capitalize font-mono text-muted-foreground">
                      {col}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PINNED EXPORT MODAL FOOTER */}
          <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between sm:justify-between shrink-0">
            <div className="text-xs text-muted-foreground">
              Matches: <strong className="text-foreground">{filteredExportProducts.length}</strong> items
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsExportModalOpen(false)}
                disabled={isExporting}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleExecuteExport}
                disabled={isExporting || filteredExportProducts.length === 0}
                className="h-9 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download File ({exportFormat.toUpperCase()})
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
