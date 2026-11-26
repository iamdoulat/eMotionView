"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useCurrency } from '@/hooks/use-currency';
import { useShipping } from '@/hooks/use-shipping';

function normalizeCartImage(src?: string): string {
  if (!src) return 'https://placehold.co/80x80.png';
  if (src.includes('.r2.cloudflarestorage.com')) {
    try {
      const urlObj = new URL(src);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (urlObj.hostname.split('.').length <= 4) parts.shift();
      return `/api/r2/proxy?key=${encodeURIComponent(decodeURIComponent(parts.join('/')))}`;
    } catch {
      return src;
    }
  }
  return src;
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, isInitialized } = useCart();
  const { formatPrice } = useCurrency();
  const { shippingCost } = useShipping(subtotal);
  const shipping = cart.length > 0 ? shippingCost : 0;
  const total = subtotal + shipping;

  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[calc(100vh-16rem)] flex flex-col justify-center items-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground mt-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mt-2">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <header className="mb-6 md:mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">Shopping Cart</h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {/* Mobile Card Layout */}
          <div className="space-y-3 md:hidden">
            {cart.map((item) => {
              const thumb = normalizeCartImage(item.images?.[0]);
              return (
                <Card key={item.id}>
                  <CardContent className="p-4 flex gap-3 items-start">
                    <Image
                      src={thumb}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md object-contain bg-secondary/30 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/products/${item.permalink || item.id}`} className="font-medium text-sm hover:text-primary line-clamp-2">
                          {item.name}
                        </Link>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFromCart(item.id)}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.brand}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Input type="number" value={item.quantity} className="w-11 h-7 text-center mx-1 px-1" readOnly />
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <span className="font-semibold text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Product</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => {
                    const thumb = normalizeCartImage(item.images?.[0]);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Image
                            src={thumb}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-md object-contain bg-secondary/30 p-1"
                            data-ai-hint={`${item.categories?.[0] ?? ""} product`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/products/${item.permalink || item.id}`} className="hover:text-primary">{item.name}</Link>
                          <p className="text-sm text-muted-foreground">{item.brand}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input type="number" value={item.quantity} className="w-14 h-8 text-center mx-2" readOnly />
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
