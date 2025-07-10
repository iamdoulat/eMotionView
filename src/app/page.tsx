
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import type { Product, HeroBanner as HeroBannerType } from '@/lib/placeholder-data';
import { defaultHeroBanners, defaultHomepageSections } from '@/lib/placeholder-data';
import { ArrowRight, Star, Tag, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryMenu } from '@/components/category-menu';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { collection, getDocs, limit, query, where, doc, getDoc } from 'firebase/firestore';
import { db, docToJSON } from '@/lib/firebase';
import { enrichProductsWithReviews } from '@/lib/product-utils';
import { cn } from '@/lib/utils';
import Autoplay from "embla-carousel-autoplay";

const BannerImage = ({ banner, className }: { banner: { image: string, link: string, name?: string }, className?: string }) => (
    <Link href={banner.link} className={cn("block rounded-lg overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl", className)}>
        <Image
            src={banner.image || 'https://placehold.co/800x400.png'}
            alt={banner.name || 'Promotional Banner'}
            width={800}
            height={400}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="promotional banner"
        />
    </Link>
);


export default async function HomePage() {
  const productsCollection = collection(db, 'products');
  const allProductsSnapshot = await getDocs(productsCollection);
  let allProducts = allProductsSnapshot.docs.map(docToJSON) as Product[];
  
  allProducts = await enrichProductsWithReviews(allProducts);
  
  // These product lists are used for the hardcoded 'product-grid' sections
  const newArrivals = allProducts.slice(0, 6);
  const popularProducts = [...allProducts].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 6);
  const smartWatches = allProducts.filter(p => p.category === 'Wearables').slice(0, 6);
  const headphones = allProducts.filter(p => p.category === 'Audio').slice(0, 6);

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


  const getProductsForGrid = (sectionName: string) => {
    switch (sectionName) {
        case 'New Arrivals': return newArrivals;
        case 'Popular Products': return popularProducts;
        case 'Smart Watches': return smartWatches;
        case 'Headphones': return headphones;
        default: return [];
    }
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
                  
                  <Carousel
                    opts={{ loop: true }}
                    plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                    className="w-full relative"
                  >
                    <CarouselContent className="h-[440px]">
                      {heroBanners.map((banner: HeroBannerType) => (
                        <CarouselItem key={banner.id}>
                          <div className="relative h-full w-full rounded-lg overflow-hidden group">
                            <Image
                              src={banner.image}
                              alt={banner.headline}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="transition-transform duration-300 group-hover:scale-105"
                              data-ai-hint="gadget festival sale"
                              priority={banner.id === heroBanners[0].id}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-8 md:p-16 flex flex-col justify-center items-start">
                              <h1 className="font-headline text-4xl font-bold tracking-tight text-white sm:text-6xl max-w-md">
                                {banner.headline}
                              </h1>
                              <p className="mt-4 text-xl leading-8 text-neutral-200 max-w-md">
                                {banner.subheadline}
                              </p>
                              <div className="mt-6">
                                <Button asChild size="lg">
                                  <Link href={banner.link}>{banner.buttonText}</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
                  </Carousel>
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
                            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground">{section.name}</h2>
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
                const products = getProductsForGrid(section.name);
                if (products.length === 0) return null;
                return (
                    <section key={section.id} className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center mb-8 border-b pb-4">
                            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">{section.name}</h2>
                            <Button asChild variant="link" className="text-primary">
                                <Link href="/products">See all</Link>
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
                        <BannerImage banner={Array.isArray(section.content) ? section.content[0] : section.content} />
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
    
