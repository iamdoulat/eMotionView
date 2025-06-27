
"use client";

import { useState } from "react";
import { products } from "@/lib/placeholder-data";
import Papa from "papaparse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BulkExportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    setIsLoading(true);

    try {
      // Flatten complex data structures for better CSV readability
      const flattenedProducts = products.map(product => ({
        ...product,
        images: product.images.join(', '),
        features: product.features.join('; '),
        specifications: JSON.stringify(product.specifications),
        productAttributes: JSON.stringify(product.productAttributes || []),
      }));

      const csv = Papa.unparse(flattenedProducts);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `products-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Your product data has been downloaded.",
      });

    } catch (error) {
      console.error("Export failed:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An error occurred while exporting the products.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Export Products</CardTitle>
        <CardDescription>Export your product data to a CSV file. This includes all product details, specifications, and attributes.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
            Click the button below to download a CSV file containing all <strong>{products.length}</strong> products in your catalog.
            This file can be used for backups, analysis, or for re-importing after making bulk changes.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleExport} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export All Products
        </Button>
      </CardFooter>
    </Card>
  );
}
