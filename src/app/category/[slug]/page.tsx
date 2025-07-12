
"use client";

import { useState, useEffect, useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product, Category, Brand } from '@/lib/placeholder-data';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db, docToJSON } from '@/lib/firebase';
import { enrichProductsWithReviews } from '@/lib/product-utils';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/breadcrumb';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCTS_PER_PAGE = 12;

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true);
      
      const categoriesCollection = collection(db, 'categories');
      const categoryQuery = query(categoriesCollection, where("permalink", "==", params.slug), limit(1));
      const categorySnapshot = await getDocs(categoryQuery);

      if (categorySnapshot.empty) {
        setIsLoading(false);
        // This will be caught by the check below
        return;
      }
      
      const foundCategory = docToJSON(categorySnapshot.docs[0]) as Category;
      setCategory(foundCategory);

      const productsCollection = collection(db, 'products');
      const productsQuery = query(productsCollection, where("categories", "array-contains", foundCategory.name));
      const productsSnapshot = await getDocs(productsQuery);
      let products = productsSnapshot.docs.map(docToJSON) as Product[];
      
      products = await enrichProductsWithReviews(products);
      setAllProducts(products);
      setBrands([...new Set(products.map(p => p.brand))]);
      setIsLoading(false);
    };

    fetchCategoryData();
  }, [params.slug]);

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = allProducts.slice(startIndex, endIndex);

  if (!isLoading && !category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading || !category ? (
          <>
            <Skeleton className="h-6 w-1/3 mb-8" />
            <Skeleton className="h-10 w-2/5 mb-2" />
            <Skeleton className="h-5 w-3/4" />
          </>
      ) : (
        <>
            <Breadcrumb
            items={[
                { label: 'Home', href: '/' },
                { label: 'Categories' },
                { label: category.name, href: `/category/${category.permalink}` },
            ]}
            />
            <header className="my-8">
                <h1 className="font-headline text-4xl font-bold text-foreground">{category.name}</h1>
                <p className="text-muted-foreground mt-2">{category.description}</p>
            </header>
        </>
      )}

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
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-56 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {currentProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full">
                    <h2 className="mt-4 text-xl font-semibold">No Products Found</h2>
                    <p className="mt-2 text-muted-foreground">There are currently no products matching your filters in the "{category?.name}" category.</p>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}
