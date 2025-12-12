"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function SSLCommerzCancelPage() {
    return (
        <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-center text-yellow-600 flex flex-col items-center gap-2">
                        <AlertCircle className="h-12 w-12" />
                        Payment Cancelled
                    </CardTitle>
                    <CardDescription className="text-center">
                        You cancelled the payment process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                        No money was deducted from your account. You can retry the payment or choose a different method.
                    </p>
                    <div className="flex justify-center">
                        <Button asChild>
                            <Link href="/checkout">Return to Checkout</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
