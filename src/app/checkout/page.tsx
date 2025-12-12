
"use client";

import { useRouter } from 'next/navigation';
import type { Order, User as Customer, BkashSettings, SSLCommerzSettings } from '@/lib/placeholder-data';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { cart, subtotal, clearCart, isInitialized } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bkash' | 'sslcommerz'>('card');
  const [bkashEnabled, setBkashEnabled] = useState(false);
  const [sslCommerzEnabled, setSslCommerzEnabled] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zipCode: "12345",
    country: "USA",
  });

  const shipping = cart.length > 0 ? 5.00 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace('/sign-in');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Check if Bkash is enabled
    const checkBkashSettings = async () => {
      try {
        const settingsRef = doc(db, 'admin_settings', 'bkash_payment');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const settings = settingsSnap.data() as BkashSettings;
          setBkashEnabled(settings.isEnabled);
        }
      } catch (error) {
        console.error('Error checking Bkash settings:', error);
      }
    };

    // Check if SSLCommerz is enabled
    const checkSSLSettings = async () => {
      try {
        const settingsRef = doc(db, 'admin_settings', 'sslcommerz_payment');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const settings = settingsSnap.data() as SSLCommerzSettings;
          setSslCommerzEnabled(settings.isEnabled);
        }
      } catch (error) {
        console.error('Error checking SSLCommerz settings:', error);
      }
    };

    checkBkashSettings();
    checkSSLSettings();
  }, []);

  useEffect(() => {
    if (isInitialized && user && cart.length === 0 && !isLoading) {
      router.replace('/cart');
    }
  }, [isInitialized, user, cart, router, isLoading]);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to place an order.',
      });
      router.push('/sign-in');
      return;
    }

    if (paymentMethod === 'bkash') {
      await handleBkashPayment();
    } else if (paymentMethod === 'sslcommerz') {
      await handleSSLCommerzPayment();
    } else {
      await handleCardPayment();
    }
  };

  const handleSSLCommerzPayment = async () => {
    setIsLoading(true);
    try {
      const orderId = doc(collection(db, 'orders')).id;
      const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      const customerData = {
        name: shippingAddress.firstName + ' ' + shippingAddress.lastName,
        email: user?.email || '',
        phone: '01700000000', // Placeholder as we don't collect phone yet
        uid: user?.uid,
      };

      // Store order details in session storage
      const pendingOrder = {
        orderId,
        orderNumber,
        customerData,
        shippingAddress,
        cart,
        total,
      };
      sessionStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));

      // Initiate Payment
      const response = await fetch('/api/sslcommerz/init-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          tranId: orderId, // using orderId as transaction ID
          customerData,
          shippingAddress,
          cart,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate SSLCommerz payment');
      }

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.GatewayPageURL) {
        window.location.href = data.GatewayPageURL;
      } else {
        throw new Error('Invalid SSLCommerz response');
      }

    } catch (error) {
      console.error('SSLCommerz payment error:', error);
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Failed to initiate payment. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleCardPayment = async () => {
    setIsLoading(true);

    try {
      const customerRef = doc(db, 'customers', user!.uid);
      const customerSnap = await getDoc(customerRef);

      if (!customerSnap.exists()) {
        throw new Error("Customer data not found.");
      }

      const customerData = customerSnap.data() as Customer;

      const newOrderRef = doc(collection(db, 'orders'));
      const orderId = newOrderRef.id;

      const newOrder: Order = {
        id: orderId,
        userId: user!.uid,
        customerEmail: user!.email ?? '',
        orderNumber: `USA-${Math.floor(Math.random() * 900000) + 100000}`,
        date: new Date().toISOString(),
        customerName: customerData.name || 'N/A',
        customerAvatar: customerData.avatar || `https://placehold.co/40x40.png?text=${customerData.name?.charAt(0) || 'U'}`,
        status: 'Pending',
        total: total,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        shippingAddress: {
          street: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          image: item.images[0],
          quantity: item.quantity,
          price: item.price,
          productType: item.productType,
          downloadUrl: item.downloadUrl,
          digitalProductNote: item.digitalProductNote,
          permalink: item.permalink,
        })),
      };

      await setDoc(newOrderRef, newOrder);

      clearCart();

      setTimeout(() => {
        router.push(`/checkout/thank-you?orderId=${orderId}`);
      }, 500);

    } catch (error) {
      console.error("Failed to place order:", error);
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: 'There was a problem placing your order. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleBkashPayment = async () => {
    setIsLoading(true);

    try {
      const customerRef = doc(db, 'customers', user!.uid);
      const customerSnap = await getDoc(customerRef);

      if (!customerSnap.exists()) {
        throw new Error("Customer data not found.");
      }

      const customerData = customerSnap.data() as Customer;

      // Step 1: Get grant token
      const tokenResponse = await fetch('/api/bkash/grant-token', {
        method: 'POST',
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get Bkash token');
      }

      const { token } = await tokenResponse.json();

      // Step 2: Create order ID for reference
      const newOrderRef = doc(collection(db, 'orders'));
      const orderId = newOrderRef.id;
      const orderNumber = `USA-${Math.floor(Math.random() * 900000) + 100000}`;

      // Step 3: Create payment
      const paymentResponse = await fetch('/api/bkash/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          orderId: orderNumber,
          token,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create Bkash payment');
      }

      const paymentData = await paymentResponse.json();

      // Save order data to sessionStorage for callback page
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        orderId,
        orderNumber,
        customerData,
        shippingAddress,
        cart,
        total,
        paymentData,
        token,
      }));

      // Redirect to Bkash payment page
      window.location.href = paymentData.bkashURL;

    } catch (error) {
      console.error("Failed to initiate Bkash payment:", error);
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: 'There was a problem initiating Bkash payment. Please try again.',
      });
      setIsLoading(false);
    }
  };


  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const keyMap = {
      'first-name': 'firstName',
      'last-name': 'lastName',
      'address': 'address',
      'city': 'city',
      'zip': 'zipCode',
      'state': 'state',
      'country': 'country'
    } as const;

    type FormId = keyof typeof keyMap;
    if (id in keyMap) {
      setShippingAddress(prev => ({ ...prev, [keyMap[id as FormId]]: value }));
    }
  }


  if (!isInitialized || !user || (cart.length === 0 && !isLoading)) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                        <Input id="first-name" placeholder="John" defaultValue={shippingAddress.firstName} onChange={handleShippingChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input id="last-name" placeholder="Doe" defaultValue={shippingAddress.lastName} onChange={handleShippingChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="123 Main St" defaultValue={shippingAddress.address} onChange={handleShippingChange} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Anytown" defaultValue={shippingAddress.city} onChange={handleShippingChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" placeholder="12345" defaultValue={shippingAddress.zipCode} onChange={handleShippingChange} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="CA" defaultValue={shippingAddress.state} onChange={handleShippingChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" placeholder="USA" defaultValue={shippingAddress.country} onChange={handleShippingChange} />
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
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-4">
                      <Label>Payment Method</Label>
                      <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'bkash' | 'sslcommerz')}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="font-normal cursor-pointer">Credit / Debit Card</Label>
                        </div>
                        {bkashEnabled && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bkash" id="bkash" />
                            <Label htmlFor="bkash" className="font-normal cursor-pointer flex items-center gap-2">
                              <span className="px-2 py-1 bg-pink-600 text-white text-xs font-semibold rounded">bKash</span>
                              Mobile Payment
                            </Label>
                          </div>
                        )}
                        {sslCommerzEnabled && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sslcommerz" id="sslcommerz" />
                            <Label htmlFor="sslcommerz" className="font-normal cursor-pointer flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">SSLCommerz</span>
                              Cards / Mobile Banking
                            </Label>
                          </div>
                        )}
                      </RadioGroup>
                    </div>

                    {paymentMethod === 'card' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input id="card-number" placeholder="**** **** **** 1234" defaultValue="4242 4242 4242 4242" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry-date">Expiry Date</Label>
                            <Input id="expiry-date" placeholder="MM/YY" defaultValue="12/28" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" defaultValue="123" />
                          </div>
                        </div>
                      </>
                    )}

                    {paymentMethod === 'bkash' && (
                      <div className="p-6 bg-pink-50 dark:bg-pink-950/20 rounded-lg border-2 border-pink-200 dark:border-pink-900">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">bK</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">bKash Payment</h4>
                            <p className="text-sm text-muted-foreground">You will be redirected to bKash to complete payment</p>
                          </div>
                        </div>
                        <p className="text-sm">
                          After clicking "Place Order", you'll be redirected to the secure bKash payment gateway to complete your transaction.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'sslcommerz' && (
                      <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-900">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">SSL</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">SSLCommerz Payment</h4>
                            <p className="text-sm text-muted-foreground">Cards, Mobile Banking, Internet Banking</p>
                          </div>
                        </div>
                        <p className="text-sm">
                          After clicking "Place Order", you'll be redirected to the secure SSLCommerz payment gateway to complete your transaction.
                        </p>
                      </div>
                    )}
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
