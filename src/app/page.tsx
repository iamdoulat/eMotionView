

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import type { Product, Category } from '@/lib/placeholder-data';
import { defaultHeroBanners, defaultHomepageSections } from '@/lib/placeholder-data';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryMenu } from '@/components/category-menu';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { collection, getDocs, limit, query, where, doc, getDoc, docToJSON } from '@/lib/db';
import { db } from '@/lib/db';
import { enrichProductsWithReviews } from '@/lib/product-utils';
import { cn } from '@/lib/utils';
import { HomepageCarousel } from '@/components/homepage-carousel';
import { ExploreCategoriesCarousel } from '@/components/explore-categories-carousel';

export const dynamic = 'force-dynamic';

const BannerImage = ({ banner, className, width = 800, height = 400 }: { banner: { image: string, link?: string, name?: string }, className?: string, width?: number, height?: number }) => {
    const bannerContent = (
        <Image
            src={banner.image || `https://placehold.co/${width}x${height}.png`}
            alt={banner.name || 'Promotional Banner'}
            width={width}
            height={height}
            className="w-full h-auto object-cover"
            data-ai-hint="promotional banner"
        />
    );

    if (banner.link) {
        return (
            <Link href={banner.link} className={cn("block rounded-lg overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl", className)}>
                {bannerContent}
            </Link>
        );
    }
    
    return <div className={cn("block rounded-lg overflow-hidden", className)}>{bannerContent}</div>
};


export default async function HomePage() {
  const productsCollection = collection(db, 'products');
  const allProductsSnapshot = await getDocs(productsCollection);
  let allProducts = allProductsSnapshot.docs.map(docToJSON) as Product[];
  
  allProducts = await enrichProductsWithReviews(allProducts);
  
  const mainNavLinks = [
    { href: "/products", label: "Campaign" },
    { href: "/products", label: "Trending" },
    { href: "/products", label: "Brands" },
    { href: "/recommendations", label: "AI Finder" },
    { href: "/track-order", label: "Support" },
  ];

  // Fetch homepage settings from Firestore, with a fallback for public users
  let settings: { [key: string]: any } | null = null;
  let allCategories: Category[] = [];
  try {
    const settingsRef = doc(db, 'public_content', 'homepage');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));

    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      settings = docToJSON(settingsSnap);
    }
    allCategories = categoriesSnapshot.docs.map(docToJSON) as Category[];

  } catch (error) {
    console.warn("Could not load homepage settings, likely due to permissions. Falling back to default layout.");
  }
  
  const heroBanners = settings?.heroBanners || defaultHeroBanners;
  const sections = settings?.sections || defaultHomepageSections;


  const getProductsForGrid = (categoryName: string) => {
    if (categoryName === 'newest') {
        // Sort all products by createdAt date
        return allProducts
            .filter(p => p.createdAt) // Ensure product has a creation date
            .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    }
    if (!categoryName) return [];
    return allProducts.filter(p => Array.isArray(p.categories) && p.categories.includes(categoryName));
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                <div className="hidden lg:block lg:col-span-1">
                    <CategoryMenu />
                </div>
                <div className="lg:col-span-3 flex flex-col">
                  <nav className="hidden md:flex items-center gap-2.5 -mt-[1px] mb-[15px] flex-wrap">
                    {mainNavLinks.map(link => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="inline-flex items-center px-3 py-1 rounded-lg border border-blue-500/50 dark:border-blue-400/50 bg-background/80 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 hover:border-blue-600 text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-2xs text-xs sm:text-sm font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  
                  <HomepageCarousel banners={heroBanners} />
                </div>
            </div>
        </div>
      </section>

      {/* DYNAMIC SECTIONS RENDERER */}
      {sections.map((section: any) => {
        switch (section.type) {
            case 'featured-categories':
                // Dynamically resolve categories directly from database (allCategories)
                let resolvedCategories: any[] = [];

                if (allCategories && allCategories.length > 0) {
                    // Sort categories: featured categories first, then display order, then alphabetically
                    const sortedCategories = [...allCategories]
                        .filter(c => c.showInMenu !== false || c.isFeatured)
                        .sort((a, b) => {
                            if (a.isFeatured && !b.isFeatured) return -1;
                            if (!a.isFeatured && b.isFeatured) return 1;
                            const orderA = a.order ?? 0;
                            const orderB = b.order ?? 0;
                            if (orderA !== orderB) return orderA - orderB;
                            return (a.name || '').localeCompare(b.name || '');
                        });

                    resolvedCategories = sortedCategories.map(c => {
                        const img = (c.image && c.image.trim()) || (c.banner && c.banner.trim()) || 'https://placehold.co/128x128.png';
                        return {
                            id: c.id,
                            name: c.name,
                            image: img,
                            permalink: c.permalink,
                        };
                    });
                } else {
                    // Fallback to static section content if database is empty
                    const categoryItems = section.content || [];
                    const legacyCategoryMap: Record<string, string> = {
                        'smart watches': 'wearables',
                        'headphones': 'audio',
                        'android smart tvs': 'smart-home',
                        'charger & cables': 'accessories',
                        'powerbanks': 'accessories',
                    };
                    resolvedCategories = categoryItems
                        .map((category: any) => {
                            const key = (category.name || '').toLowerCase();
                            const categoryData = allCategories.find(
                                c => c.name.toLowerCase() === key || c.permalink === legacyCategoryMap[key]
                            );
                            return {
                                id: category.id,
                                name: category.name,
                                image: category.image || 'https://placehold.co/128x128.png',
                                permalink: categoryData?.permalink || key.replace(/\s+/g, '-'),
                            };
                        })
                        .filter(Boolean);
                }

                if (resolvedCategories.length === 0) return null;
                return (
                    <section key={section.id} className="container mx-auto px-4 py-8">
                        <div className="text-center mb-6">
                            <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-foreground">Explore Popular Categories</h2>
                             <p className="text-muted-foreground mt-2 text-sm md:text-base">Find your preferred item in the highlighted product selection.</p>
                        </div>
                        <ExploreCategoriesCarousel categories={resolvedCategories} />
                    </section>
                );

            case 'product-grid':
                const products = getProductsForGrid(section.content?.category);
                if (products.length === 0) return null;
                
                // For "New Arrivals", the link should go to the general products page
                const isNewArrivals = section.content?.category === 'newest';
                const categoryData = isNewArrivals ? null : allCategories.find(c => c.name === section.content?.category);
                const permalink = isNewArrivals ? '/products' : (categoryData ? `/category/${categoryData.permalink}` : null);

                if (!permalink) return null;

                return (
                    <section key={section.id} className="container mx-auto px-4 py-2 md:py-4">
                        <div className="flex justify-between items-center mb-3 md:mb-6 border-b pb-2 md:pb-4">
                            <h2 className="font-headline text-base md:text-2xl font-bold tracking-tight text-foreground">{section.name}</h2>
                            <Button asChild variant="outline" size="sm" className="h-7 px-3 text-xs rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Link href={permalink}>See All</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-6 xl:gap-x-6">
                            {products.slice(0, 6).map((product, index) => (
                                <div key={product.id} className={index >= 4 ? "hidden md:block" : ""}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </section>
                );

            case 'promo-banner-trio':
                return (
                    <section key={section.id} className="container mx-auto px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {section.content.map((banner: any) => <BannerImage key={banner.id} banner={banner} />)}
                        </div>
                    </section>
                );
            case 'promo-banner-pair':
                 return (
                    <section key={section.id} className="container mx-auto px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {section.content.map((banner: any) => <BannerImage key={banner.id} banner={banner} />)}
                        </div>
                    </section>
                );
            case 'single-banner-large':
            case 'one-column-banner':
                return (
                     <section key={section.id} className="container mx-auto px-4 py-4">
                        <BannerImage banner={Array.isArray(section.content) ? section.content[0] : section.content} width={1200} height={150} />
                    </section>
                );
             case 'two-column-banner':
                return (
                    <section key={section.id} className="container mx-auto px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {section.content.map((banner: any) => <BannerImage key={banner.id} banner={banner} />)}
                        </div>
                    </section>
                );
            case 'three-column-banner':
                return (
                    <section key={section.id} className="container mx-auto px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {section.content.map((banner: any) => <BannerImage key={banner.id} banner={banner} />)}
                        </div>
                    </section>
                );
            default:
                return null;
        }
      })}

    </div>
  );
}
    

    
