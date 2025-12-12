"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function SSLCommerzFailPage() {
    return (
        <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-center text-destructive flex flex-col items-center gap-2">
                        <XCircle className="h-12 w-12" />
                        Payment Failed
                    </CardTitle>
                    <CardDescription className="text-center">
                        We processed your payment using SSLCommerz, but it was unsuccessful.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                        Please check your payment details and try again. No money was deducted from your account.
                    </p>
                    <div className="flex justify-center">
                        <Button asChild>
                            <Link href="/checkout">Try Again</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
