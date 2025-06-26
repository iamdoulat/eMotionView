import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/placeholder-data';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);

  const heroCategories = [
    { name: 'Smart Watches', href: '/products?category=Wearables' },
    { name: 'Smart Phones', href: '/products?category=Smartphones' },
    { name: 'Headphones', href: '/products?category=Audio' },
    { name: 'Smart TV & Accessories', href: '/products?category=Smart+Home' },
    { name: 'Computer & Accessories', href: '/products?category=Laptops' },
    { name: 'Wireless Speakers', href: '/products?category=Audio' },
    { name: 'Security Cameras', href: '/products?category=Smart+Home' },
    { name: 'Smart Home Appliances', href: '/products?category=Smart+Home' },
    { name: 'Charger & Cables', href: '/products?category=Accessories' },
    { name: 'Powerbanks', href: '/products?category=Accessories' },
    { name: 'Network Components', href: '/products?category=Accessories' },
    { name: 'Health & Outdoors', href: '/products?category=Accessories' },
  ];

  return (
    <div className="flex flex-col bg-secondary/50">
      {/* Hero Section */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Category Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="bg-primary rounded-t-lg p-3">
                    <CardTitle className="text-primary-foreground text-base flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5" />
                        All Categories
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <ul className="space-y-1">
                      {heroCategories.map((category) => (
                        <li key={category.name}>
                            <Link 
                                href={category.href} 
                                className="flex items-center p-2 text-sm rounded-md text-muted-foreground hover:bg-secondary hover:text-primary"
                            >
                                {category.name}
                            </Link>
                        </li>
                      ))}
                    </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Hero Banner */}
            <div className="lg:col-span-3">
              <div className="relative h-64 md:h-[425px] w-full rounded-lg overflow-hidden group">
                <Image 
                  src="https://placehold.co/900x425.png"
                  alt="Stay Powered Anywhere, Anytime"
                  fill
                  style={{objectFit: 'cover'}}
                  className="transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="power banks sale"
                  priority
                />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent p-8 md:p-16 flex flex-col justify-center items-start">
                    <h1 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-5xl max-w-md">
                        Stay Powered <br/> Anywhere, Anytime
                    </h1>
                    <p className="mt-4 text-lg leading-8 text-neutral-200 max-w-md">
                        Explore Our Range of High-Capacity Power Banks
                    </p>
                    <div className="mt-6">
                        <Button asChild size="lg" variant="destructive" className="bg-red-600 hover:bg-red-700">
                            <Link href="/products?category=Accessories">Shop Now</Link>
                        </Button>
                    </div>
                </div>
              </div>
            </div>
          </div>
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
