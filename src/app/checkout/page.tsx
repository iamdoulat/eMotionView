
"use client";

import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/placeholder-data';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function CheckoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { cart, subtotal, clearCart, isInitialized } = useCart();
  
  const shipping = cart.length > 0 ? 5.00 : 0;
  const total = subtotal + shipping;

  // Redirect to cart if it's empty
  useEffect(() => {
    if (isInitialized && cart.length === 0) {
      router.replace('/cart');
    }
  }, [isInitialized, cart, router]);

  const handlePlaceOrder = () => {
    setIsLoading(true);

    const newOrder: Order = {
        id: `order-${Date.now()}`,
        orderNumber: `USA-${Math.floor(Math.random() * 900000) + 100000}`,
        date: new Date().toISOString(),
        customerName: 'John Doe', // Hardcoded for prototype
        customerAvatar: 'https://placehold.co/40x40.png',
        status: 'Pending',
        total: total,
        items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            image: item.images[0],
            quantity: item.quantity,
            price: item.price,
            productType: item.productType,
            downloadUrl: item.downloadUrl,
            digitalProductNote: item.digitalProductNote,
        })),
    };

    // Simulate API call and order creation
    setTimeout(() => {
        try {
            const existingOrders: Order[] = JSON.parse(localStorage.getItem('newOrders') || '[]');
            localStorage.setItem('newOrders', JSON.stringify([...existingOrders, newOrder]));
            
            clearCart();
            
            router.push(`/checkout/thank-you?orderId=${newOrder.id}`);
        } catch (error) {
            console.error("Failed to place order:", error);
            // Handle error, e.g., show a toast message
            setIsLoading(false);
        }
    }, 1500);
  };
  
  // Loading state while cart is initializing or if cart is empty
  if (!isInitialized || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // The main component render
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold text-foreground">Checkout</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <Accordion type="single" defaultValue="shipping" collapsible className="w-full">
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-2xl font-headline">1. Shipping Information</AccordionTrigger>
              <AccordionContent className="pt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input id="first-name" placeholder="John" defaultValue="John"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input id="last-name" placeholder="Doe" defaultValue="Doe"/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="123 Main St" defaultValue="123 Main St"/>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="space-y-2 col-span-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Anytown" defaultValue="Anytown"/>
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" placeholder="12345" defaultValue="12345"/>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="payment">
              <AccordionTrigger className="text-2xl font-headline">2. Payment Details</AccordionTrigger>
              <AccordionContent className="pt-4">
                <Card>
                   <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="**** **** **** 1234" defaultValue="4242 4242 4242 4242"/>
                      </div>
                       <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry-date">Expiry Date</Label>
                          <Input id="expiry-date" placeholder="MM/YY" defaultValue="12/28"/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" defaultValue="123"/>
                        </div>
                      </div>
                   </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div>
          <h2 className="text-2xl font-headline mb-4">Order Summary</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                {cart.map(item => (
                  <div className="flex justify-between" key={item.id}>
                    <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                    <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
