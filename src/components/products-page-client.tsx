"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/placeholder-data';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/hooks/use-currency';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';

const PRODUCTS_PER_PAGE = 12;

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating-desc';

export function ProductsPageClient({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();
  const { symbol } = useCurrency();

  const maxCatalogPrice = useMemo(() => {
    const maxP = initialProducts.reduce((m, p) => Math.max(m, p.price || 0), 0);
    return Math.max(500, Math.ceil(maxP / 50) * 50);
  }, [initialProducts]);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get('category');
    return cat ? [cat] : [];
  });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(maxCatalogPrice);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const qParam = searchParams.get('q');
    const catParam = searchParams.get('category');
    if (qParam !== null) setSearchQuery(qParam);
    if (catParam) setSelectedCategories([catParam]);
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    setMaxPrice(maxCatalogPrice);
  }, [maxCatalogPrice]);

  const categories = useMemo(
    () => [...new Set(initialProducts.flatMap(p => p.categories || []).filter(Boolean))],
    [initialProducts]
  );
  const brands = useMemo(
    () => [...new Set(initialProducts.map(p => p.brand).filter(Boolean))],
    [initialProducts]
  );

  const toggleItem = (list: string[], value: string, setter: (next: string[]) => void) => {
    setCurrentPage(1);
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaxPrice(maxCatalogPrice);
    setMinRating(null);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = initialProducts.filter(product => {
      if (q) {
        const hay = `${product.name} ${product.brand} ${product.description} ${(product.categories || []).join(' ')} ${product.sku || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedCategories.length > 0) {
        const prodCats = (product.categories || []).map(c => c.toLowerCase());
        const matchesCat = selectedCategories.some(c => prodCats.includes(c.toLowerCase()));
        if (!matchesCat) return false;
      }
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }
      if (product.price > maxPrice) {
        return false;
      }
      if (minRating !== null && (product.rating || 0) < minRating) {
        return false;
      }
      return true;
    });

    const sorted = [...result];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      default:
        break;
    }
    return sorted;
  }, [initialProducts, searchQuery, selectedCategories, selectedBrands, maxPrice, minRating, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    maxPrice < maxCatalogPrice ||
    minRating !== null;

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <header className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">Our Products</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Showing {filteredProducts.length} of {initialProducts.length} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="md:hidden"
            onClick={() => setShowMobileFilters(prev => !prev)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {showMobileFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px]" aria-label="Sort products">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating-desc">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <aside className={`${showMobileFilters ? 'block' : 'hidden'} md:block md:col-span-1`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-xl font-semibold">Filters</h2>
            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
                <X className="mr-1 h-3 w-3" /> Clear
              </Button>
            )}
          </div>
          <div className="space-y-6">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
            <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
              <AccordionItem value="category">
                <AccordionTrigger className="font-semibold">Category</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  {categories.map((category, index) => (
                    <div key={`${category}-${index}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={selectedCategories.some(c => c.toLowerCase() === category.toLowerCase())}
                        onCheckedChange={() => toggleItem(selectedCategories, category, setSelectedCategories)}
                      />
                      <Label htmlFor={`cat-${category}`} className="font-normal cursor-pointer">{category}</Label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="brand">
                <AccordionTrigger className="font-semibold">Brand</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  {brands.map((brand, index) => (
                    <div key={`${brand}-${index}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleItem(selectedBrands, brand, setSelectedBrands)}
                      />
                      <Label htmlFor={`brand-${brand}`} className="font-normal cursor-pointer">{brand}</Label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price">
                <AccordionTrigger className="font-semibold">Price Range</AccordionTrigger>
                <AccordionContent className="pt-4">
                  <Slider
                    value={[maxPrice]}
                    max={maxCatalogPrice}
                    step={10}
                    onValueChange={(vals) => { setMaxPrice(vals[0] ?? maxCatalogPrice); setCurrentPage(1); }}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{symbol}0</span>
                    <span>Up to {symbol}{maxPrice}</span>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="rating">
                <AccordionTrigger className="font-semibold">Rating</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={`rating-${rating}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={minRating === rating}
                        onCheckedChange={(checked) => { setMinRating(checked ? rating : null); setCurrentPage(1); }}
                      />
                      <Label htmlFor={`rating-${rating}`} className="font-normal cursor-pointer">{rating} Stars & Up</Label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {hasActiveFilters && (
              <Button type="button" variant="outline" className="w-full" onClick={clearFilters}>
                Reset Filters
              </Button>
            )}
          </div>
        </aside>

        <div className="md:col-span-3">
          {currentProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 lg:grid-cols-3">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {safePage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h2 className="text-xl font-semibold">No Products Found</h2>
              <p className="mt-2 text-muted-foreground">Try adjusting or clearing your search and filters.</p>
              {hasActiveFilters && (
                <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
