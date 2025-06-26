import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/placeholder-data';
import { ArrowRight, Star, Tag, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryMenu } from '@/components/category-menu';

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);

  const categoryItems = [
    { name: 'Smart Watch', href: '/products?category=Wearables', image: 'https://placehold.co/100x100.png', hint: 'smartwatch' },
    { name: 'Smart Phone', href: '/products?category=Smartphones', image: 'https://placehold.co/100x100.png', hint: 'smartphone' },
    { name: 'Headphone', href: '/products?category=Audio', image: 'https://placehold.co/100x100.png', hint: 'headphones' },
    { name: 'Laptop', href: '/products?category=Laptops', image: 'https://placehold.co/100x100.png', hint: 'laptop' },
    { name: 'Drone', href: '/products?category=Drones', image: 'https://placehold.co/100x100.png', hint: 'drone' },
    { name: 'Camera', href: '/products?category=Accessories', image: 'https://placehold.co/100x100.png', hint: 'camera' },
    { name: 'Speaker', href: '/products?category=Audio', image: 'https://placehold.co/100x100.png', hint: 'speaker' },
    { name: 'Router', href: '/products?category=Accessories', image: 'https://placehold.co/100x100.png', hint: 'router' },
    { name: 'Power Bank', href: '/products?category=Accessories', image: 'https://placehold.co/100x100.png', hint: 'power bank' },
    { name: 'Accessories', href: '/products?category=Accessories', image: 'https://placehold.co/100x100.png', hint: 'gadget accessories' },
  ];

  return (
    <div className="flex flex-col bg-secondary/50">
      {/* Hero Section */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                {/* Category Menu */}
                <div className="hidden lg:block lg:col-span-1">
                    <CategoryMenu />
                </div>

                {/* Hero Banner */}
                <div className="lg:col-span-3">
                  <div className="relative h-64 md:h-full w-full rounded-lg overflow-hidden group">
                    <Image 
                      src="https://placehold.co/900x440.png"
                      alt="Stay Powered Anywhere, Anytime"
                      fill
                      style={{objectFit: 'cover'}}
                      className="transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="power banks sale"
                      priority
                    />
                     <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent p-8 md:p-16 flex flex-col justify-center items-start">
                        <h1 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-5xl max-w-md">
                            Stay Powered <br/> Anywhere, Anytime
                        </h1>
                        <p className="mt-4 text-lg leading-8 text-neutral-200 max-w-md">
                            Explore Our Range of High-Capacity Power Banks
                        </p>
                        <div className="mt-6">
                            <Button asChild size="lg">
                                <Link href="/products?category=Accessories">Shop Now</Link>
                            </Button>
                        </div>
                    </div>
                  </div>
                </div>
            </div>
        </div>
      </section>

      {/* Info Banners Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex items-center p-4 bg-background">
            <CardContent className="flex items-center gap-4 p-0">
              <div className="bg-primary/10 p-3 rounded-full">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Best Price & Offers</h3>
                <p className="text-sm text-muted-foreground">Orders $50 or more</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex items-center p-4 bg-background">
            <CardContent className="flex items-center gap-4 p-0">
              <div className="bg-primary/10 p-3 rounded-full">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Free Delivery</h3>
                <p className="text-sm text-muted-foreground">24/7 amazing services</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex items-center p-4 bg-background">
            <CardContent className="flex items-center gap-4 p-0">
              <div className="bg-primary/10 p-3 rounded-full">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Official Product</h3>
                <p className="text-sm text-muted-foreground">100% genuine</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground">Shop by Category</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Find what you're looking for with our product categories.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categoryItems.map((category) => (
            <Link key={category.name} href={category.href} className="group text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 group-hover:shadow-lg">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  data-ai-hint={category.hint}
                />
              </div>
              <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground">Featured Products</h2>
          <Button asChild variant="link" className="text-primary">
            <Link href="/products">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
