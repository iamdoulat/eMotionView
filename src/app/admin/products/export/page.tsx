"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Download,
  FileDown,
  FileSpreadsheet,
  FileCode,
  Loader2,
  SlidersHorizontal,
  Check,
  FileUp,
} from "lucide-react";

export default function BulkExportPage() {
  const { toast } = useToast();
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters & Options
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Selected Columns
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
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

  const handleExport = () => {
    if (filteredProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Products Matched",
        description: "No catalog products matched your export criteria.",
      });
      return;
    }

    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().split("T")[0];

      if (exportFormat === "json") {
        const exportData = filteredProducts.map((p) => {
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
        const exportData = filteredProducts.map((p) => {
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
        title: "Export Finished",
        description: `Successfully exported ${filteredProducts.length} products to ${exportFormat.toUpperCase()}.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An error occurred while generating the catalog export.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold tracking-tight">Bulk Export Products</CardTitle>
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-primary/5 text-primary border-primary/20">
                  Data Pipeline
                </Badge>
              </div>
              <CardDescription className="text-sm mt-1">
                Export custom subsets of your catalog to CSV spreadsheets or full JSON backups.
              </CardDescription>
            </div>

            <Button asChild variant="outline" className="h-9 text-xs font-semibold border-border hover:bg-muted">
              <Link href="/admin/products/import">
                <FileUp className="mr-2 h-4 w-4 text-primary" />
                Go to Bulk Import
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Format Selection Cards */}
          <div className="space-y-2.5">
            <Label className="text-xs font-bold">1. Choose Export File Format</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setExportFormat("csv")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  exportFormat === "csv"
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
                      Compatible with Microsoft Excel, Google Sheets, and bulk re-importing.
                    </p>
                  </div>
                </div>
                {exportFormat === "csv" && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>

              <div
                onClick={() => setExportFormat("json")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  exportFormat === "json"
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
                      Structured backup containing nested specifications and variant options.
                    </p>
                  </div>
                </div>
                {exportFormat === "json" && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filter Criteria */}
            <div className="lg:col-span-2 p-5 rounded-2xl border bg-card space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground">2. Filter Export Scope</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Category</Label>
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

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Brand</Label>
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

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Stock Level</Label>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Inventory</SelectItem>
                      <SelectItem value="in_stock">In Stock Only (&gt; 0)</SelectItem>
                      <SelectItem value="low_stock">Low Stock (1 - 10)</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock (0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Product Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
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

            {/* Columns & Action */}
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

              <div className="space-y-2 max-h-[220px] overflow-y-auto modal-scrollbar pr-1">
                {Object.keys(selectedColumns).map((col) => (
                  <div key={col} className="flex items-center space-x-2 text-xs">
                    <Checkbox
                      id={`page-col-${col}`}
                      checked={selectedColumns[col]}
                      onCheckedChange={(checked) =>
                        setSelectedColumns((prev) => ({ ...prev, [col]: !!checked }))
                      }
                    />
                    <Label htmlFor={`page-col-${col}`} className="text-xs cursor-pointer capitalize font-mono text-muted-foreground hover:text-foreground">
                      {col}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Matching Items:</span>
                  <Badge variant="secondary" className="font-mono">
                    {filteredProducts.length} of {catalogProducts.length}
                  </Badge>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={isExporting || filteredProducts.length === 0}
                  className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating File...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export {filteredProducts.length} Products ({exportFormat.toUpperCase()})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
