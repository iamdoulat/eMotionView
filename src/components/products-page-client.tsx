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
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [minPrice, setMinPrice] = useState<number>(0);
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
    setMinPrice(0);
    setMaxPrice(maxCatalogPrice);
    setMinRating(null);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const pageTitle = useMemo(() => {
    if (selectedCategories.length === 1) {
      return selectedCategories[0];
    }
    if (selectedCategories.length > 1) {
      return selectedCategories.join(', ');
    }
    if (searchQuery.trim()) {
      return `Search: "${searchQuery.trim()}"`;
    }
    return "All Products";
  }, [selectedCategories, searchQuery]);

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
      if (product.price < minPrice || product.price > maxPrice) {
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
  }, [initialProducts, searchQuery, selectedCategories, selectedBrands, minPrice, maxPrice, minRating, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    minPrice > 0 ||
    maxPrice < maxCatalogPrice ||
    minRating !== null;

  return (
    <div className="container mx-auto px-4 py-5 md:py-7">
      {/* TOP HEADER ROW: Matching bordered boxes for Sidebar and Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-stretch mb-5">
        {/* Left Box: Filter Header Card */}
        <div className="md:col-span-1 rounded-xl border border-border/80 bg-card px-4 py-3 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-foreground/80" />
            <span className="font-semibold text-sm tracking-wide text-foreground">Filter</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className={cn(
              "h-7 px-3 text-xs font-medium rounded-md border-border transition-all cursor-pointer",
              hasActiveFilters ? "text-primary hover:bg-primary/10 border-primary/40" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            Reset
          </Button>
        </div>

        {/* Right Box: Category Title & Sort Card */}
        <div className="md:col-span-3 rounded-xl border border-border/80 bg-card px-4 py-3 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-baseline gap-3 min-w-0">
            <h1 className="font-headline text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight truncate">
              {pageTitle}
            </h1>
            <span className="text-xs text-muted-foreground shrink-0 font-medium hidden sm:inline">
              ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'})
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            {/* Mobile filter toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="md:hidden h-8 px-3 text-xs font-medium rounded-md border-border"
              onClick={() => setShowMobileFilters((prev) => !prev)}
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              {showMobileFilters ? "Hide Filters" : "Filters"}
            </Button>

            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v as SortOption);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[155px] sm:w-[170px] h-8 text-xs font-medium rounded-md border-border/80" aria-label="Sort products">
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
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
        {/* Left Column: Filter Sidebar Card with borders */}
        <aside
          className={cn(
            "md:col-span-1 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-5",
            showMobileFilters ? "block" : "hidden md:block"
          )}
        >
          {/* Quick Search */}
          <div>
            <Input
              placeholder="Search in results..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8.5 text-xs rounded-lg border-border/80 bg-background/50 focus-visible:ring-1"
            />
          </div>

          <Accordion
            type="multiple"
            defaultValue={["price", "brand", "category", "rating"]}
            className="w-full space-y-3"
          >
            {/* PRICE ACCORDION */}
            <AccordionItem value="price" className="border-b border-border/60 pb-4">
              <AccordionTrigger className="py-1 text-xs font-bold tracking-wider uppercase text-foreground hover:no-underline">
                PRICE
              </AccordionTrigger>
              <AccordionContent className="pt-3 space-y-3.5">
                <div className="px-1 pt-1">
                  <Slider
                    value={[minPrice, maxPrice]}
                    max={maxCatalogPrice}
                    step={10}
                    onValueChange={(vals) => {
                      if (vals.length === 2) {
                        setMinPrice(vals[0]);
                        setMaxPrice(vals[1]);
                      } else if (vals.length === 1) {
                        setMaxPrice(vals[0]);
                      }
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="grid grid-cols-5 items-center gap-2 pt-1">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground block text-left">
                      Min Price
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={maxPrice}
                      value={minPrice}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        setMinPrice(Math.min(val, maxPrice));
                        setCurrentPage(1);
                      }}
                      className="h-8 text-xs font-medium text-center rounded-lg border-border/80 bg-background"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center text-muted-foreground font-bold pt-4 select-none">
                    –
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground block text-left">
                      Max Price
                    </Label>
                    <Input
                      type="number"
                      min={minPrice}
                      max={maxCatalogPrice}
                      value={maxPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value) || maxCatalogPrice;
                        setMaxPrice(Math.max(val, minPrice));
                        setCurrentPage(1);
                      }}
                      className="h-8 text-xs font-medium text-center rounded-lg border-border/80 bg-background"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* BRANDS ACCORDION */}
            {brands.length > 0 && (
              <AccordionItem value="brand" className="border-b border-border/60 pb-4">
                <AccordionTrigger className="py-1 text-xs font-bold tracking-wider uppercase text-foreground hover:no-underline">
                  BRANDS
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {brands.map((brand, index) => {
                    const isChecked = selectedBrands.includes(brand);
                    const count = initialProducts.filter((p) => p.brand === brand).length;
                    return (
                      <div
                        key={`${brand}-${index}`}
                        onClick={() => toggleItem(selectedBrands, brand, setSelectedBrands)}
                        className="flex items-center justify-between text-xs py-0.5 cursor-pointer hover:text-primary transition-colors group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleItem(selectedBrands, brand, setSelectedBrands)}
                            className="rounded"
                          />
                          <Label
                            htmlFor={`brand-${brand}`}
                            className="font-medium text-xs cursor-pointer group-hover:text-primary"
                          >
                            {brand}
                          </Label>
                        </div>
                        <span className="text-[11px] text-muted-foreground">({count})</span>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* CATEGORIES ACCORDION */}
            {categories.length > 0 && (
              <AccordionItem value="category" className="border-b border-border/60 pb-4">
                <AccordionTrigger className="py-1 text-xs font-bold tracking-wider uppercase text-foreground hover:no-underline">
                  CATEGORIES
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {categories.map((category, index) => {
                    const isChecked = selectedCategories.some(
                      (c) => c.toLowerCase() === category.toLowerCase()
                    );
                    const count = initialProducts.filter((p) =>
                      (p.categories || []).some(
                        (c) => c.toLowerCase() === category.toLowerCase()
                      )
                    ).length;
                    return (
                      <div
                        key={`${category}-${index}`}
                        onClick={() => toggleItem(selectedCategories, category, setSelectedCategories)}
                        className="flex items-center justify-between text-xs py-0.5 cursor-pointer hover:text-primary transition-colors group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Checkbox
                            id={`cat-${category}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleItem(selectedCategories, category, setSelectedCategories)}
                            className="rounded"
                          />
                          <Label
                            htmlFor={`cat-${category}`}
                            className="font-medium text-xs cursor-pointer group-hover:text-primary"
                          >
                            {category}
                          </Label>
                        </div>
                        <span className="text-[11px] text-muted-foreground">({count})</span>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* RATING ACCORDION */}
            <AccordionItem value="rating" className="border-none pb-1">
              <AccordionTrigger className="py-1 text-xs font-bold tracking-wider uppercase text-foreground hover:no-underline">
                RATING
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const isChecked = minRating === rating;
                  return (
                    <div
                      key={`rating-${rating}`}
                      onClick={() => {
                        setMinRating(isChecked ? null : rating);
                        setCurrentPage(1);
                      }}
                      className="flex items-center space-x-2.5 text-xs py-0.5 cursor-pointer hover:text-primary transition-colors group"
                    >
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          setMinRating(checked ? rating : null);
                          setCurrentPage(1);
                        }}
                        className="rounded"
                      />
                      <Label
                        htmlFor={`rating-${rating}`}
                        className="font-medium text-xs cursor-pointer flex items-center gap-1 group-hover:text-primary"
                      >
                        <span>{rating} Stars & Up</span>
                      </Label>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>

        {/* Right Column: Products Grid */}
        <div className="md:col-span-3">
          {currentProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="rounded-lg h-8 text-xs cursor-pointer"
                  >
                    <ChevronLeft className="mr-1.5 h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <span className="text-xs font-semibold text-muted-foreground px-2">
                    Page {safePage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="rounded-lg h-8 text-xs cursor-pointer"
                  >
                    Next
                    <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-border/80 rounded-xl bg-card/40">
              <h2 className="text-lg font-semibold text-foreground">No Products Found</h2>
              <p className="mt-1 text-xs text-muted-foreground">Try adjusting or resetting your search and filters.</p>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 h-8 text-xs rounded-lg cursor-pointer"
                  onClick={clearFilters}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
