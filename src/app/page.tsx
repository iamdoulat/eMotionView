import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/placeholder-data';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col">
      <section className="bg-card py-20 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            eMotionView: See Products Differently
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Discover a new era of online shopping with intelligent recommendations tailored just for you.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button asChild variant="link" size="lg">
              <Link href="/recommendations">Get AI Advice <span aria-hidden="true">→</span></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center">Featured Products</h2>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      <section className="bg-card">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="relative isolate overflow-hidden px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
             <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/70 to-accent opacity-80"></div>
             <div className="relative z-10">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Unsure what to choose?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
                Our advanced AI analyzes your needs to provide personalized product recommendations. Get advice you can trust.
                </p>
                <div className="mt-10 flex items-center justify-center">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/recommendations">
                    Try Our Recommender
                    <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
