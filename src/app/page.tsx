import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/placeholder-data';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);

  const categories = [
    { name: 'Smart Watches', href: '/products?category=Wearables', image: 'https://placehold.co/150x150.png', hint: 'smartwatch' },
    { name: 'Headphones', href: '/products?category=Audio', image: 'https://placehold.co/150x150.png', hint: 'headphones' },
    { name: 'Android Smart TVs', href: '/products?category=Smart+Home', image: 'https://placehold.co/150x150.png', hint: 'smart tv' },
    { name: 'Charger & Cables', href: '/products?category=Accessories', image: 'https://placehold.co/150x150.png', hint: 'phone charger' },
    { name: 'Powerbanks', href: '/products?category=Accessories', image: 'https://placehold.co/150x150.png', hint: 'power bank' },
    { name: 'Computer Monitors', href: '/products?category=Accessories', image: 'https://placehold.co/150x150.png', hint: 'computer monitor' },
    { name: 'Smart Home Appliances', href: '/products?category=Smart+Home', image: 'https://placehold.co/150x150.png', hint: 'security camera' },
    { name: 'Wireless Speakers', href: '/products?category=Audio', image: 'https://placehold.co/150x150.png', hint: 'wireless speaker' },
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
      
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/products?category=Wearables" className="block relative h-48 rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/600x300.png"
              alt="New Arrivals"
              fill
              style={{objectFit: 'cover'}}
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="smartwatch sale"
            />
            <div className="absolute inset-0 bg-primary/80 p-6 flex flex-col justify-center">
              <h3 className="font-headline text-2xl font-bold text-primary-foreground uppercase">New Arrival</h3>
              <p className="text-primary-foreground/90 text-sm">The latest smartwatches are here.</p>
              <Button variant="link" className="text-primary-foreground p-0 h-auto justify-start mt-2 hover:underline">Order Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </Link>
          <Link href="/products?category=Accessories" className="block relative h-48 rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/600x300.png"
              alt="Power Banks"
              fill
              style={{objectFit: 'cover'}}
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="power bank"
            />
            <div className="absolute inset-0 bg-primary/80 p-6 flex flex-col justify-center">
              <h3 className="font-headline text-2xl font-bold text-primary-foreground uppercase">Power Banks</h3>
              <p className="text-primary-foreground/90 text-sm">Stay charged, stay ahead.</p>
              <Button variant="link" className="text-primary-foreground p-0 h-auto justify-start mt-2 hover:underline">Order Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </Link>
          <Link href="/products?category=Accessories" className="block relative h-48 rounded-lg overflow-hidden group">
             <Image
              src="https://placehold.co/600x300.png"
              alt="Fast Chargers"
              fill
              style={{objectFit: 'cover'}}
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="phone charger"
            />
            <div className="absolute inset-0 bg-foreground/80 p-6 flex flex-col justify-center items-center text-center">
              <p className="text-background/90 text-sm">SAMSUNG 25W ADAPTER</p>
              <h3 className="font-headline text-4xl font-bold text-background uppercase">Fast Charge</h3>
              <p className="text-background/90 text-xs">PD 3.0 PPS | USB Type-C Support</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground text-center mb-2">Explore Popular Categories</h2>
          <p className="text-muted-foreground text-center mb-12">Find your preferred item in the highlighted product selection.</p>
          <div className="flex flex-wrap justify-center items-start gap-x-8 gap-y-12">
            {categories.map((category) => (
              <Link href={category.href} key={category.name} className="flex flex-col items-center text-center gap-3 group w-32">
                <div className="bg-secondary rounded-full p-3 flex items-center justify-center w-24 h-24 group-hover:bg-primary/10 transition-colors duration-300">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={category.hint}
                  />
                </div>
                <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
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
