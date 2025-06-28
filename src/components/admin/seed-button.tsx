
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/lib/actions/seed';
import { Database, Loader2 } from 'lucide-react';

export function SeedButton() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleClick = async () => {
        setIsLoading(true);
        try {
            const result = await seedDatabase();
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Seeding Failed',
                    description: result.error,
                });
            } else {
                 toast({
                    title: 'Database Seeded!',
                    description: `${result.message}`,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'An unexpected error occurred while seeding the database.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleClick} disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Database className="mr-2 h-4 w-4" />
            )}
            Seed Database
        </Button>
    );
}
