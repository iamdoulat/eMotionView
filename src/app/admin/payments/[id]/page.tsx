"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, docToJSON } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import type { Order } from '@/lib/placeholder-data';

export default function PaymentDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { user, role, isLoading: isAuthLoading } = useAuth();
    const [order, setOrder] = useState<Order | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAuthLoading) return;

        if (!user || !role || !['Admin', 'Manager', 'Staff'].includes(role)) {
            router.push('/');
            return;
        }

        const fetchOrder = async () => {
            if (!params.id) {
                setOrder(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const orderRef = doc(db, 'orders', params.id);
                const docSnap = await getDoc(orderRef);

                if (docSnap.exists()) {
                    const orderData = docToJSON(docSnap) as Order;
                    setOrder(orderData);
                } else {
                    setOrder(null);
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                setOrder(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [params.id, user, role, isAuthLoading, router]);

    const getPaymentStatusBadge = (status?: string) => {
        switch (status) {
            case 'completed':
                return <Badge variant="default">Completed</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'refunded':
                return <Badge variant="outline">Refunded</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getPaymentMethodBadge = (method?: string) => {
        switch (method) {
            case 'bkash':
                return <Badge className="bg-pink-600 hover:bg-pink-700">Bkash</Badge>;
            case 'card':
                return <Badge variant="secondary">Card</Badge>;
            default:
                return <Badge variant="outline">N/A</Badge>;
        }
    };

    if (isLoading || isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Transaction Not Found</CardTitle>
                        <CardDescription>
                            The requested payment transaction could not be found.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin/payments">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Payments
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/admin/payments">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Payments
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Payment Transaction Details</h1>
                <p className="text-muted-foreground mt-2">
                    Order #{order.orderNumber}
                </p>
            </div>

            <div className="grid gap-6">
                {/* Payment Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                <div className="mt-1">{getPaymentMethodBadge(order.paymentMethod)}</div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                                <div className="mt-1">{getPaymentStatusBadge(order.paymentStatus)}</div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Date</p>
                                <p className="text-lg">{new Date(order.date).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bkash Transaction Details */}
                {order.paymentMethod === 'bkash' && order.paymentDetails?.bkash && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Bkash Transaction Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                                    <p className="font-mono text-sm">{order.paymentDetails.bkash.paymentID}</p>
                                </div>
                                {order.paymentDetails.bkash.trxID && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Transaction ID (trxID)</p>
                                        <p className="font-mono text-sm">{order.paymentDetails.bkash.trxID}</p>
                                    </div>
                                )}
                                {order.paymentDetails.bkash.transactionID && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                                        <p className="font-mono text-sm">{order.paymentDetails.bkash.transactionID}</p>
                                    </div>
                                )}
                                {order.paymentDetails.bkash.customerMsisdn && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Customer Mobile</p>
                                        <p className="font-mono text-sm">{order.paymentDetails.bkash.customerMsisdn}</p>
                                    </div>
                                )}
                                {order.paymentDetails.bkash.payerReference && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Payer Reference</p>
                                        <p className="font-mono text-sm">{order.paymentDetails.bkash.payerReference}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                    <p className="font-mono text-sm">{order.paymentDetails.bkash.amount} {order.paymentDetails.bkash.currency}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Intent</p>
                                    <p className="text-sm capitalize">{order.paymentDetails.bkash.intent}</p>
                                </div>
                                {order.paymentDetails.bkash.merchantInvoiceNumber && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Merchant Invoice Number</p>
                                        <p className="font-mono text-sm">{order.paymentDetails.bkash.merchantInvoiceNumber}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                <p>{order.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p>{order.customerEmail}</p>
                            </div>
                        </div>
                        {order.shippingAddress && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</p>
                                    <address className="not-italic text-sm">
                                        {order.shippingAddress.street}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                        {order.shippingAddress.country}
                                    </address>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
