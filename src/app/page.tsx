

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/placeholder-data';
import { defaultHeroBanners, defaultHomepageSections } from '@/lib/placeholder-data';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryMenu } from '@/components/category-menu';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { collection, getDocs, limit, query, where, doc, getDoc } from 'firebase/firestore';
import { db, docToJSON } from '@/lib/firebase';
import { enrichProductsWithReviews } from '@/lib/product-utils';
import { cn } from '@/lib/utils';
import { HomepageCarousel } from '@/components/homepage-carousel';

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
    { href: "#", label: "Campaign" },
    { href: "/products", label: "Trending" },
    { href: "#", label: "Brands" },
    { href: "#", label: "Outlets" },
    { href: "#", label: "Support" },
  ];

  // Fetch homepage settings from Firestore, with a fallback for public users
  let settings: { [key: string]: any } | null = null;
  try {
    const settingsRef = doc(db, 'public_content', 'homepage');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      settings = settingsSnap.data();
    }
  } catch (error) {
    console.warn("Could not load homepage settings, likely due to permissions. Falling back to default layout.");
  }
  
  const heroBanners = settings?.heroBanners || defaultHeroBanners;
  const sections = settings?.sections || defaultHomepageSections;


  const getProductsForGrid = (category: string) => {
    if (!category) return [];
    return allProducts.filter(p => p.categories.includes(category)).slice(0, 6);
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
                  <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground -mt-[1px] mb-[15px]">
                    {mainNavLinks.map(link => (
                      <Link key={link.label} href={link.href} className="hover:text-primary transition-colors flex items-center">
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
                const categoryItems = section.content || [];
                return (
                    <section key={section.id} className="container mx-auto px-4 py-8">
                        <div className="text-center mb-6">
                            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground">Explore Popular Categories</h2>
                             <p className="text-muted-foreground mt-2">Find your preferred item in the highlighted product selection.</p>
                        </div>
                        <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                            <CarouselContent className="-ml-4">
                            {categoryItems.map((category: any) => (
                                <CarouselItem key={category.id} className="basis-auto pl-4 md:pl-6">
                                <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="group text-center block w-[130px]">
                                    <div className="w-32 h-32 mx-auto rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 group-hover:shadow-lg">
                                        <Image src={category.image} alt={category.name} width={128} height={128} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" data-ai-hint="category icon" />
                                    </div>
                                    <h3 className="mt-4 font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{category.name}</h3>
                                </Link>
                                </CarouselItem>
                            ))}
                            </CarouselContent>
                        </Carousel>
                    </section>
                );

            case 'product-grid':
                const products = getProductsForGrid(section.content?.category);
                if (products.length === 0) return null;
                return (
                    <section key={section.id} className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center mb-8 border-b pb-4">
                            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">{section.name}</h2>
                            <Button asChild variant="link" className="text-primary">
                                <Link href={`/products?category=${encodeURIComponent(section.content?.category)}`}>See all</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:gap-x-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
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
    

    
