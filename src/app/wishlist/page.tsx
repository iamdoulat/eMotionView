"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, ShoppingCart, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/placeholder-data';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { useCurrency } from '@/hooks/use-currency';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isInitialized, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <header className="mb-6 md:mb-8 flex items-center gap-3">
        <Heart className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground">Your Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-1">Products you love, saved for later.</p>
        </div>
      </header>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4">
          {wishlistItems.map((product) => (
            <Card key={product.id} className="group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full bg-background">
              <CardHeader className="p-0 border-b bg-card">
                <div className="flex items-center justify-end px-2.5 pt-2.5 pb-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full border border-border/70 bg-secondary/50 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground"
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">Remove from wishlist</span>
                  </Button>
                </div>
                <Link href={`/products/${product.permalink || product.id}`} className="block px-2.5 pb-2.5">
                  <div className="aspect-square rounded-md bg-secondary/20 overflow-hidden">
                    <Image
                      src={product.images?.[0] || 'https://placehold.co/600x600.png'}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={`${product.categories?.[0] ?? ""} product`}
                    />
                  </div>
                </Link>
              </CardHeader>
              <CardContent className="p-3 flex-grow flex flex-col">
                <h3 className="text-sm font-medium h-10 line-clamp-2">
                  <Link href={`/products/${product.permalink || product.id}`} className="hover:text-primary transition-colors">
                    {product.name}
                  </Link>
                </h3>
                <p className="text-base sm:text-lg font-bold text-primary mt-2">{formatPrice(product.price)}</p>
              </CardContent>
              <CardFooter className="p-3 pt-0">
                <Button size="sm" className="w-full" onClick={() => handleMoveToCart(product)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Move to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 md:py-20 border-2 border-dashed rounded-lg px-4">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 text-lg md:text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Looks like you haven&apos;t added anything yet.</p>
          <Button asChild size="sm" className="mt-5">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
