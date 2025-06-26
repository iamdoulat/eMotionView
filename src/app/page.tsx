import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/placeholder-data';
import { Card } from '@/components/ui/card';
import { ArrowRight, Rocket, Glasses, Watch, Laptop, Headphones, Cable, Home, Bot } from 'lucide-react';

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);

  const categories = [
    { name: 'Drones', icon: Rocket, href: '/products?category=Drones' },
    { name: 'VR/AR', icon: Glasses, href: '/products?category=VR/AR' },
    { name: 'Wearables', icon: Watch, href: '/products?category=Wearables' },
    { name: 'Laptops', icon: Laptop, href: '/products?category=Laptops' },
    { name: 'Audio', icon: Headphones, href: '/products?category=Audio' },
    { name: 'Accessories', icon: Cable, href: '/products?category=Accessories' },
    { name: 'Smart Home', icon: Home, href: '/products?category=Smart+Home' },
    { name: 'AI Advisor', icon: Bot, href: '/recommendations' },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-card border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden">
            <Image 
              src="https://placehold.co/1200x400.png"
              alt="Hero banner"
              fill
              style={{objectFit: 'cover'}}
              data-ai-hint="shopping sale promotion"
              priority
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-4">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-5xl">
                Find Your Next Gadget
              </h1>
              <p className="mt-4 text-lg leading-8 text-neutral-200">
                Exclusive deals on the latest tech.
              </p>
              <div className="mt-6">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/products">Shop All Products</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground text-center mb-4">Shop by Category</h2>
           <p className="text-muted-foreground text-center mb-10">Find what you're looking for with our product categories.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link href={category.href} key={category.name} className="block group">
                 <Card className="text-center p-6 bg-card group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center h-full aspect-square">
                  <category.icon className="h-10 w-10 mb-4 text-primary transition-colors" />
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{category.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Featured Products</h2>
            <Button asChild variant="link" className="text-primary">
              <Link href="/products">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
