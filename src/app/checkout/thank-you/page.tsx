import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ThankYouClientPage } from './client-page';

function ThankYouPageLoading() {
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

export default function ThankYouPage() {
    return (
        <Suspense fallback={<ThankYouPageLoading />}>
            <ThankYouClientPage />
        </Suspense>
    );
}
