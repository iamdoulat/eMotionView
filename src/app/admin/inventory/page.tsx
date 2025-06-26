
"use client";

import { useState, useMemo } from 'react';
import { products as allProducts } from '@/lib/placeholder-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const LOW_STOCK_THRESHOLD = 10;

type StockStatus = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

function getStockStatus(stock: number): { label: 'In Stock' | 'Low Stock' | 'Out of Stock'; variant: 'default' | 'secondary' | 'destructive' } {
  if (stock === 0) {
    return { label: 'Out of Stock', variant: 'destructive' };
  }
  if (stock < LOW_STOCK_THRESHOLD) {
    return { label: 'Low Stock', variant: 'secondary' };
  }
  return { label: 'In Stock', variant: 'default' };
}

export default function AdminInventoryPage() {
  const [filter, setFilter] = useState<StockStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter(product => {
        const stockStatus = getStockStatus(product.stock).label.toLowerCase().replace(' ', '-');
        if (filter === 'all') return true;
        return stockStatus === filter;
      })
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [filter, searchTerm]);

  const stats = useMemo(() => {
    const totalProducts = allProducts.length;
    const outOfStock = allProducts.filter(p => p.stock === 0).length;
    const lowStock = allProducts.filter(p => p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD).length;
    return { totalProducts, outOfStock, lowStock };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Unique SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items in Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts - stats.outOfStock - stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Healthy stock levels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Nearing depletion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">Need to reorder</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                  <CardTitle>Inventory</CardTitle>
                  <CardDescription>Track and manage your product inventory.</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name, SKU..." className="pl-8" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button>Add Product</Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as StockStatus)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in-stock">In Stock</TabsTrigger>
              <TabsTrigger value="low-stock" className="data-[state=active]:text-accent data-[state=inactive]:text-accent/80">Low Stock</TabsTrigger>
              <TabsTrigger value="out-of-stock" className="data-[state=active]:text-destructive data-[state=inactive]:text-destructive/80">Out of Stock</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="border rounded-md">
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Supplier</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {filteredProducts.map((product) => {
                      const status = getStockStatus(product.stock);
                      return (
                      <TableRow key={product.id}>
                          <TableCell>
                          <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="rounded-md object-cover"
                              data-ai-hint="product"
                          />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                          <TableCell className={cn("text-right font-medium", {
                              "text-accent": status.label === 'Low Stock',
                              "text-destructive": status.label === 'Out of Stock',
                          })}>
                              {product.stock}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className={cn({
                                'bg-accent text-accent-foreground hover:bg-accent/80 border-transparent': status.label === 'Low Stock',
                                'bg-green-600 text-white hover:bg-green-700 border-transparent': status.label === 'In Stock',
                            })}>
                                {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.supplier}</TableCell>
                      </TableRow>
                      );
                  })}
                  </TableBody>
              </Table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                No products found for this filter.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
