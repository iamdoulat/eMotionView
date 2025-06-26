import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/placeholder-data';
import { ArrowRight, Bot } from 'lucide-react';

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);

  const categories = [
    { name: 'Smart Watches', href: '/products?category=Wearables', image: 'https://placehold.co/150x150/EBEBEB/808080.png', hint: 'smartwatch' },
    { name: 'Headphones', href: '/products?category=Audio', image: 'https://placehold.co/150x150/E0E0E0/808080.png', hint: 'headphones' },
    { name: 'Android Smart TVs', href: '/products?category=Smart+Home', image: 'https://placehold.co/150x150/D6D6D6/808080.png', hint: 'smart tv' },
    { name: 'Charger & Cables', href: '/products?category=Accessories', image: 'https://placehold.co/150x150/CCCCCC/808080.png', hint: 'phone charger' },
    { name: 'Powerbanks', href: '/products?category=Accessories', image: 'https://placehold.co/150x150/C2C2C2/808080.png', hint: 'power bank' },
    { name: 'Computer Monitors', href: '/products?category=Accessories', image: 'https://placehold.co/150x150/B8B8B8/808080.png', hint: 'computer monitor' },
    { name: 'Smart Home Appliances', href: '/products?category=Smart+Home', image: 'https://placehold.co/150x150/AFAFAF/808080.png', hint: 'security camera' },
    { name: 'Wireless Speakers', href: '/products?category=Audio', image: 'https://placehold.co/150x150/A5A5A5/808080.png', hint: 'wireless speaker' },
  ];

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden group">
            <Image 
              src="https://placehold.co/1200x400/EAEAEA/808080.png"
              alt="Hero banner"
              fill
              style={{objectFit: 'cover'}}
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="shopping sale promotion"
              priority
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-8 md:p-16">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-5xl max-w-md">
                Find Your Perfect Gadget With AI
              </h1>
              <p className="mt-4 text-lg leading-8 text-neutral-200 max-w-md">
                Our AI-powered assistant helps you find the right products for your needs.
              </p>
              <div className="mt-6">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/recommendations">Try AI Advisor <Bot className="ml-2" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Banners */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/products?category=Wearables" className="block relative h-48 rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/600x400/E0E0E0/808080.png"
              alt="New Arrivals"
              fill
              style={{objectFit: 'cover'}}
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="product promotion"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
              <h3 className="font-headline text-2xl font-bold text-white">Smartwatch Sale</h3>
              <p className="text-white/90 text-sm">Up to 30% off on selected models.</p>
            </div>
          </Link>
          <Link href="/products?category=Audio" className="block relative h-48 rounded-lg overflow-hidden group">
            <Image
              src="https://placehold.co/600x400/D0D0D0/808080.png"
              alt="Audio Devices"
              fill
              style={{objectFit: 'cover'}}
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="headphones sale"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
              <h3 className="font-headline text-2xl font-bold text-white">Crystal Clear Audio</h3>
              <p className="text-white/90 text-sm">Experience premium sound.</p>
            </div>
          </Link>
          <Link href="/products?category=Accessories" className="block relative h-48 rounded-lg overflow-hidden group">
             <Image
              src="https://placehold.co/600x400/C0C0C0/808080.png"
              alt="Accessories"
              fill
              style={{objectFit: 'cover'}}
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="tech accessories"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
              <h3 className="font-headline text-2xl font-bold text-white">Must-Have Accessories</h3>
              <p className="text-white/90 text-sm">Everything you need for your gadgets.</p>
            </div>
          </Link>
        </div>
      </section>
      
      {/* Shop by Category */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground mb-2">Shop by Category</h2>
        <p className="text-muted-foreground mb-8">Find what you&apos;re looking for with our product categories.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <Link href={category.href} key={category.name} className="flex flex-col items-center text-center gap-3 group">
              <div className="bg-secondary rounded-full p-1 flex items-center justify-center w-28 h-28 group-hover:bg-primary/10 transition-colors duration-300">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={100}
                  height={100}
                  className="rounded-full object-contain transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={category.hint}
                />
              </div>
              <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
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
