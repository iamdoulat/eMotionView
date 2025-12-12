"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Order } from '@/lib/placeholder-data';

function BkashCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [message, setMessage] = useState('Processing your payment...');

    useEffect(() => {
        const processPayment = async () => {
            try {
                const paymentID = searchParams.get('paymentID');
                const paymentStatus = searchParams.get('status');

                if (!paymentID) {
                    setStatus('failed');
                    setMessage('Invalid payment response. Missing payment ID.');
                    return;
                }

                if (paymentStatus === 'cancel' || paymentStatus === 'failure') {
                    setStatus('failed');
                    setMessage('Payment was cancelled or failed. Please try again.');
                    return;
                }

                // Retrieve pending order data from sessionStorage
                const pendingOrderStr = sessionStorage.getItem('pendingOrder');
                if (!pendingOrderStr) {
                    setStatus('failed');
                    setMessage('Order data not found. Please start over.');
                    return;
                }

                const pendingOrder = JSON.parse(pendingOrderStr);

                // Execute the payment
                const executeResponse = await fetch('/api/bkash/execute-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentID,
                        token: pendingOrder.token,
                    }),
                });

                if (!executeResponse.ok) {
                    throw new Error('Failed to execute payment');
                }

                const executedPayment = await executeResponse.json();

                if (executedPayment.transactionStatus !== 'Completed') {
                    setStatus('failed');
                    setMessage('Payment execution failed. Please contact support.');
                    return;
                }

                // Create the order with payment details
                const orderRef = doc(db, 'orders', pendingOrder.orderId);

                const newOrder: Order = {
                    id: pendingOrder.orderId,
                    userId: pendingOrder.customerData.uid || pendingOrder.customerData.id,
                    customerEmail: pendingOrder.customerData.email || '',
                    orderNumber: pendingOrder.orderNumber,
                    date: new Date().toISOString(),
                    customerName: pendingOrder.customerData.name || 'N/A',
                    customerAvatar: pendingOrder.customerData.avatar || `https://placehold.co/40x40.png?text=${pendingOrder.customerData.name?.charAt(0) || 'U'}`,
                    status: 'Pending',
                    total: pendingOrder.total,
                    paymentMethod: 'bkash',
                    paymentStatus: 'completed',
                    paymentDetails: {
                        method: 'bkash',
                        status: 'completed',
                        bkash: {
                            paymentID: executedPayment.paymentID,
                            transactionID: executedPayment.transactionID,
                            trxID: executedPayment.trxID,
                            payerReference: executedPayment.payerReference,
                            customerMsisdn: executedPayment.customerMsisdn,
                            amount: parseFloat(executedPayment.amount),
                            currency: executedPayment.currency,
                            intent: executedPayment.intent,
                            merchantInvoiceNumber: executedPayment.merchantInvoiceNumber,
                        },
                    },
                    shippingAddress: {
                        street: pendingOrder.shippingAddress.address,
                        city: pendingOrder.shippingAddress.city,
                        state: pendingOrder.shippingAddress.state,
                        zipCode: pendingOrder.shippingAddress.zipCode,
                        country: pendingOrder.shippingAddress.country,
                    },
                    items: pendingOrder.cart.map((item: any) => ({
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

                await setDoc(orderRef, newOrder);

                // Clear session storage
                sessionStorage.removeItem('pendingOrder');

                setStatus('success');
                setMessage('Payment successful! Redirecting...');

                // Redirect to thank you page
                setTimeout(() => {
                    router.push(`/checkout/thank-you?orderId=${pendingOrder.orderId}`);
                }, 2000);

            } catch (error) {
                console.error('Payment processing error:', error);
                setStatus('failed');
                setMessage('An error occurred while processing your payment. Please contact support.');
            }
        };

        processPayment();
    }, [searchParams, router]);

    return (
        <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-center">
                        {status === 'processing' && 'Processing Payment'}
                        {status === 'success' && 'Payment Successful!'}
                        {status === 'failed' && 'Payment Failed'}
                    </CardTitle>
                    <CardDescription className="text-center">{message}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    {status === 'processing' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                    {status === 'success' && (
                        <div className="text-6xl text-green-500">✓</div>
                    )}
                    {status === 'failed' && (
                        <div className="text-6xl text-destructive">✗</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function BkashCallbackPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <BkashCallbackContent />
        </Suspense>
    );
}
