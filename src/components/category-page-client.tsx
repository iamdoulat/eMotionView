
"use client";

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product, Category } from '@/lib/placeholder-data';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCTS_PER_PAGE = 12;

interface CategoryPageClientProps {
    initialProducts: Product[];
    category: Category;
}

export function CategoryPageClient({ initialProducts, category }: CategoryPageClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  
  // You can implement filter states here in the future
  // For now, we'll just use the initial products list for pagination
  
  const brands = [...new Set(initialProducts.map(p => p.brand))];

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
      <aside className="md:col-span-1">
        <h2 className="font-headline text-xl font-semibold mb-4">Filters</h2>
        <div className="space-y-6">
          <Input placeholder="Search products..." />
          <Accordion type="multiple" defaultValue={['brand', 'price']} className="w-full">
            <AccordionItem value="brand">
              <AccordionTrigger className="font-semibold">Brand</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">
                {brands.map((brand, index) => (
                  <div key={`${brand}-${index}`} className="flex items-center space-x-2">
                    <Checkbox id={`brand-${brand}`} />
                    <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="price">
              <AccordionTrigger className="font-semibold">Price Range</AccordionTrigger>
              <AccordionContent className="pt-4">
                <Slider defaultValue={[500]} max={2000} step={50} />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>$0</span>
                  <span>$2000</span>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rating">
              <AccordionTrigger className="font-semibold">Rating</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={`rating-${rating}`} className="flex items-center space-x-2">
                    <Checkbox id={`rating-${rating}`} />
                    <Label htmlFor={`rating-${rating}`} className="font-normal">{rating} Stars & Up</Label>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button className="w-full">Apply Filters</Button>
        </div>
      </aside>

      <main className="md:col-span-3">
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full">
            <h2 className="mt-4 text-xl font-semibold">No Products Found</h2>
            <p className="mt-2 text-muted-foreground">There are currently no products matching your filters in the "{category.name}" category.</p>
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
