
"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { type Order } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Home, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function ThankYouClientPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<Order | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            setOrder(null);
            setIsLoading(false);
            return;
        }

        const fetchOrder = async () => {
            setIsLoading(true);
            try {
                const orderRef = doc(db, 'orders', orderId);
                const orderSnap = await getDoc(orderRef);
                if (orderSnap.exists()) {
                    setOrder({ id: orderSnap.id, ...orderSnap.data() } as Order);
                } else {
                    setOrder(null);
                }
            } catch (error) {
                console.error("Error fetching order:", error);
                setOrder(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-16rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (order === undefined) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold">Order not found.</h1>
                <p className="text-muted-foreground">Please check the order ID or return to the homepage.</p>
                <Button asChild className="mt-4">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" /> Go to Homepage
                    </Link>
                </Button>
            </div>
        );
    }

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = order.total - subtotal;

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <Card className="shadow-lg">
                <CardHeader className="text-center items-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="text-3xl font-headline">Thank You For Your Order!</CardTitle>
                    <CardDescription className="text-base">
                        Your order has been placed successfully. A confirmation email has been sent.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">Date: {new Date(order.date).toLocaleDateString()}</p>
                    </div>

                    <h4 className="font-semibold mb-4">Items Ordered</h4>
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md border" data-ai-hint="product"/>
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2 text-right">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping:</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-center gap-4">
                        <Button asChild size="lg" variant="outline">
                            <Link href="/account/orders">View My Orders</Link>
                        </Button>
                        <Button asChild size="lg">
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
