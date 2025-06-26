
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/placeholder-data';
import { ArrowRight, Star, Tag, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryMenu } from '@/components/category-menu';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export default function HomePage() {
  const newArrivals = products.slice(0, 6);
  const popularProducts = products.slice(0, 6);
  const smartWatches = products.filter(p => p.category === 'Wearables').slice(0, 6);
  const headphones = products.filter(p => p.category === 'Audio').slice(0, 6);

  const mainNavLinks = [
    { href: "#", label: "Campaign" },
    { href: "/products", label: "Trending" },
    { href: "#", label: "Brands" },
    { href: "#", label: "Outlets" },
    { href: "#", label: "Support" },
  ];

  const categoryItems = [
    { name: 'Smart Watches', href: '/products?category=Wearables', image: 'https://placehold.co/128x128.png', hint: 'smartwatch' },
    { name: 'Headphones', href: '/products?category=Audio', image: 'https://placehold.co/128x128.png', hint: 'headphones' },
    { name: 'Android Smart TVs', href: '/products?category=Smart+Home', image: 'https://placehold.co/128x128.png', hint: 'smart tv' },
    { name: 'Charger & Cables', href: '/products?category=Accessories', image: 'https://placehold.co/128x128.png', hint: 'phone charger' },
    { name: 'Powerbanks', href: '/products?category=Accessories', image: 'https://placehold.co/128x128.png', hint: 'power bank' },
    { name: 'Computer Monitors', href: '/products?category=Accessories', image: 'https://placehold.co/128x128.png', hint: 'computer monitor' },
    { name: 'Smart Home Appliances', href: '/products?category=Smart+Home', image: 'https://placehold.co/128x128.png', hint: 'smart appliance' },
    { name: 'Wireless Speakers', href: '/products?category=Audio', image: 'https://placehold.co/128x128.png', hint: 'wireless speaker' },
    { name: 'Smart Phones', href: '/products?category=Smartphones', image: 'https://placehold.co/128x128.png', hint: 'smartphone' },
    { name: 'Laptops', href: '/products?category=Laptops', image: 'https://placehold.co/128x128.png', hint: 'laptop' },
    { name: 'Drones', href: '/products?category=Drones', image: 'https://placehold.co/128x128.png', hint: 'drone' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Category Menu */}
                <div className="hidden lg:block lg:col-span-1">
                    <CategoryMenu />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-3 flex flex-col">
                  {/* Main Nav */}
                  <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground -mt-[1px] mb-[15px]">
                    {mainNavLinks.map(link => (
                      <Link key={link.href} href={link.href} className="hover:text-primary transition-colors flex items-center">
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  
                  {/* Hero Banner */}
                  <div className="relative h-[440px] w-full rounded-lg overflow-hidden group">
                    <Image 
                      src="https://placehold.co/900x440.png"
                      alt="Gadget Fest"
                      fill
                      style={{objectFit: 'cover'}}
                      className="transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="gadget festival sale"
                      priority
                    />
                     <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-8 md:p-16 flex flex-col justify-center items-start">
                        <h1 className="font-headline text-4xl font-bold tracking-tight text-white sm:text-6xl max-w-md">
                            GADGET FEST
                        </h1>
                        <p className="mt-4 text-xl leading-8 text-neutral-200 max-w-md">
                            Up to 60% off on your favorite gadgets.
                        </p>
                        <div className="mt-6">
                            <Button asChild size="lg">
                                <Link href="/products">Shop Now</Link>
                            </Button>
                        </div>
                    </div>
                  </div>
                </div>
            </div>
        </div>
      </section>

      {/* Three Banners Section */}
      <section className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="#" className="block rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/400x200.png"
              alt="New Arrival Smartwatches"
              width={400}
              height={200}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="smartwatch sale"
            />
          </Link>
          <Link href="#" className="block rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/400x200.png"
              alt="Power Banks"
              width={400}
              height={200}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="power bank"
            />
          </Link>
          <Link href="#" className="block rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/400x200.png"
              alt="Samsung 25W Adapter"
              width={400}
              height={200}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="phone adapter"
            />
          </Link>
        </div>
      </section>


      {/* Shop by Category Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground">Explore Popular Categories</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Find your preferred item in the highlighted product selection.</p>
        </div>
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {categoryItems.map((category) => (
              <CarouselItem key={category.name} className="basis-auto pl-4 md:pl-6">
                <Link href={category.href} className="group text-center block w-[130px]">
                  <div className="w-32 h-32 mx-auto rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 group-hover:shadow-lg">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      data-ai-hint={category.hint}
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{category.name}</h3>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* New Arrival Products */}
      <section className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">New Arrival</h2>
          <Button asChild variant="link" className="text-primary">
            <Link href="/products?sort=newest">See all</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:gap-x-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotional Banners Section */}
      <section className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="#" className="block rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/800x400.png"
              alt="Kospet Smartwatch Deals"
              width={800}
              height={400}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="smartwatch advertisement"
            />
          </Link>
          <Link href="#" className="block rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/800x400.png"
              alt="Xiaomi Home Appliance"
              width={800}
              height={400}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="smart home appliances"
            />
          </Link>
        </div>
      </section>

      {/* Popular Products */}
      <section className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Popular Products</h2>
          <Button asChild variant="link" className="text-primary">
            <Link href="/products">See all</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:gap-x-6">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Smart Watches Section */}
      <section className="container mx-auto px-4 py-4">
        <div className="mb-8">
          <Link href="/products?category=Wearables" className="block rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/1200x250.png"
              alt="Wear Style. Wear Technology"
              width={1200}
              height={250}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="smartwatch technology banner"
            />
          </Link>
        </div>
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Smart Watches</h2>
          <Button asChild variant="link" className="text-primary">
            <Link href="/products?category=Wearables">See all</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:gap-x-6">
          {smartWatches.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Headphones Section */}
      <section className="container mx-auto px-4 py-4">
        <div className="mb-8">
          <Link href="/products?category=Audio" className="block rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/1200x250.png"
              alt="Plug it, Listen to it, Feel it"
              width={1200}
              height={250}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="headphones advertisement banner"
            />
          </Link>
        </div>
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Headphones</h2>
          <Button asChild variant="link" className="text-primary">
            <Link href="/products?category=Audio">See all</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:gap-x-6">
          {headphones.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
