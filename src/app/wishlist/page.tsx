
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingCart, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/placeholder-data';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isInitialized } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleMoveToCart = (product: Product) => {
    addToCart(product.id, 1);
    removeFromWishlist(product.id);
    toast({
      title: "Moved to Cart",
      description: `${product.name} has been moved to your cart.`,
    });
  };

  if (!isInitialized) {
    return (
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-16rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center gap-4">
        <Heart className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold text-foreground">Your Wishlist</h1>
          <p className="text-muted-foreground mt-2">Products you love, saved for later.</p>
        </div>
      </header>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlistItems.map((product) => (
            <Card key={product.id} className="group relative overflow-hidden">
              <CardHeader className="p-0">
                <Link href={`/products/${product.id}`}>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-60 object-cover"
                    data-ai-hint={`${product.category} product`}
                  />
                </Link>
                 <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => removeFromWishlist(product.id)}>
                  <X className="h-4 w-4" />
                   <span className="sr-only">Remove from wishlist</span>
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-base font-headline mb-2 h-10 line-clamp-2">
                  <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">{product.name}</Link>
                </CardTitle>
                <p className="text-lg font-bold text-primary">৳{product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter className="p-4">
                <Button className="w-full" onClick={() => handleMoveToCart(product)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Move to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven&apos;t added anything yet.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
