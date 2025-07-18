
"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/placeholder-data';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCTS_PER_PAGE = 12;

export function ProductsPageClient({ initialProducts }: { initialProducts: Product[] }) {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false); // Initially false as we have initialProducts
  const [currentPage, setCurrentPage] = useState(1);

  // If you want to refetch on client, you can uncomment this
  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     setIsLoading(true);
  //     const productsSnapshot = await getDocs(collection(db, 'products'));
  //     let products = productsSnapshot.docs.map(docToJSON) as Product[];
  //     products = await enrichProductsWithReviews(products);
  //     setAllProducts(products);
  //     setIsLoading(false);
  //   };
  //   fetchProducts();
  // }, []);

  const categories = [...new Set(allProducts.flatMap(p => p.categories || []))];
  const brands = [...new Set(allProducts.map(p => p.brand))];

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = allProducts.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-foreground">Our Products</h1>
        <p className="text-muted-foreground mt-2">Explore our collection of cutting-edge tech and accessories.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <aside className="md:col-span-1">
          <h2 className="font-headline text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-6">
            <Input placeholder="Search products..." />
            <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
              <AccordionItem value="category">
                <AccordionTrigger className="font-semibold">Category</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  {categories.map((category, index) => (
                    <div key={`${category}-${index}`} className="flex items-center space-x-2">
                      <Checkbox id={`cat-${category}`} />
                      <Label htmlFor={`cat-${category}`} className="font-normal">{category}</Label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
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
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-56 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}
