
"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileDown, Loader2 } from "lucide-react";

interface ParsedProduct {
  [key: string]: string;
}

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv") {
        setError("Invalid file type. Please upload a CSV file.");
        setFile(null);
        setParsedData([]);
        setHeaders([]);
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseCsv(selectedFile);
    }
  };

  const parseCsv = (fileToParse: File) => {
    setIsLoading(true);
    setParsedData([]);
    setHeaders([]);
    Papa.parse<ParsedProduct>(fileToParse, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setError("Error parsing CSV file. Please check the format.");
          console.error("CSV Parsing Errors:", results.errors);
          setParsedData([]);
          setHeaders([]);
        } else {
          setHeaders(results.meta.fields || []);
          setParsedData(results.data);
          setError(null);
        }
        setIsLoading(false);
      },
      error: (err) => {
        setError("An unexpected error occurred while parsing the file.");
        console.error(err);
        setIsLoading(false);
      }
    });
  };
  
  const handleImport = () => {
      // This is a simulation. In a real app, you would send `parsedData` to your API endpoint.
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          toast({
              title: "Import Successful",
              description: `${parsedData.length} products have been queued for import.`,
          });
          // Reset state after import
          setFile(null);
          setParsedData([]);
          setHeaders([]);
      }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Products</CardTitle>
          <CardDescription>Import products from a CSV file. Upload a file to see a preview before importing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border-dashed border-2 rounded-md space-y-2 text-center">
            <Label htmlFor="csv-upload" className="block text-sm font-medium cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium">{file ? file.name : 'Click to upload or drag and drop a CSV file'}</span>
            </Label>
            <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="sr-only" />
            <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
          </div>
          <Button asChild variant="link" className="px-0">
            <Link href="/sample-products.csv" download>
              <FileDown className="mr-2 h-4 w-4" />
              Download sample CSV file
            </Link>
          </Button>
          {error && <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {isLoading && !parsedData.length && (
         <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Parsing file...</span>
         </div>
      )}

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Preview</CardTitle>
            <CardDescription>Showing the first {parsedData.length > 10 ? 10 : parsedData.length} rows from your file. Review the data before starting the import.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headers.map(header => <TableCell key={header} className="max-w-[200px] truncate">{row[header]}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {parsedData.length} Products
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
