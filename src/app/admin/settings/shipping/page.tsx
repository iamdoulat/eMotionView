"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Truck, Gift, Store } from 'lucide-react';
import type { ShippingSettings, ShippingMethod } from '@/lib/placeholder-data';

const shippingSettingsSchema = z.object({
    flatRate: z.object({
        isEnabled: z.boolean(),
        cost: z.coerce.number().min(0, 'Cost must be positive'),
        description: z.string().optional(),
    }),
    freeShipping: z.object({
        isEnabled: z.boolean(),
        minOrderAmount: z.coerce.number().min(0, 'Minimum must be positive'),
        description: z.string().optional(),
    }),
    localPickup: z.object({
        isEnabled: z.boolean(),
        description: z.string().optional(),
    }),
});

type ShippingSettingsFormData = z.infer<typeof shippingSettingsSchema>;

export default function ShippingSettingsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ShippingSettingsFormData>({
        resolver: zodResolver(shippingSettingsSchema),
        defaultValues: {
            flatRate: {
                isEnabled: true,
                cost: 5.00,
                description: 'Standard flat rate shipping',
            },
            freeShipping: {
                isEnabled: false,
                minOrderAmount: 50,
                description: 'Free shipping on orders over minimum amount',
            },
            localPickup: {
                isEnabled: false,
                description: 'Pick up from our store location',
            },
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const settingsRef = doc(db, 'admin_settings', 'shipping');
                const settingsSnap = await getDoc(settingsRef);

                if (settingsSnap.exists()) {
                    const data = settingsSnap.data() as ShippingSettings;

                    // Transform from array to form structure
                    const flatRate = data.methods.find(m => m.type === 'flat_rate');
                    const freeShipping = data.methods.find(m => m.type === 'free_shipping');
                    const localPickup = data.methods.find(m => m.type === 'local_pickup');

                    form.reset({
                        flatRate: {
                            isEnabled: flatRate?.isEnabled ?? true,
                            cost: flatRate?.cost ?? 5.00,
                            description: flatRate?.description ?? 'Standard flat rate shipping',
                        },
                        freeShipping: {
                            isEnabled: freeShipping?.isEnabled ?? false,
                            minOrderAmount: freeShipping?.minOrderAmount ?? 50,
                            description: freeShipping?.description ?? 'Free shipping on orders over minimum amount',
                        },
                        localPickup: {
                            isEnabled: localPickup?.isEnabled ?? false,
                            description: localPickup?.description ?? 'Pick up from our store location',
                        },
                    });
                }
            } catch (error) {
                console.error('Error fetching shipping settings:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load shipping settings',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [toast, form]);

    const onSubmit = async (data: ShippingSettingsFormData) => {
        if (!user) return;
        setIsSaving(true);

        try {
            const methods: ShippingMethod[] = [
                {
                    id: 'flat_rate',
                    type: 'flat_rate',
                    title: 'Flat Rate',
                    cost: data.flatRate.cost,
                    isEnabled: data.flatRate.isEnabled,
                    description: data.flatRate.description,
                },
                {
                    id: 'free_shipping',
                    type: 'free_shipping',
                    title: 'Free Shipping',
                    cost: 0,
                    isEnabled: data.freeShipping.isEnabled,
                    minOrderAmount: data.freeShipping.minOrderAmount,
                    description: data.freeShipping.description,
                },
                {
                    id: 'local_pickup',
                    type: 'local_pickup',
                    title: 'Local Pickup',
                    cost: 0,
                    isEnabled: data.localPickup.isEnabled,
                    description: data.localPickup.description,
                },
            ];

            const settingsData: ShippingSettings = {
                methods,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid,
            };

            await setDoc(doc(db, 'admin_settings', 'shipping'), settingsData);

            toast({
                title: 'Success',
                description: 'Shipping settings saved successfully',
            });
        } catch (error) {
            console.error('Error saving shipping settings:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save shipping settings',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Shipping Methods</h1>
                <p className="text-muted-foreground mt-2">
                    Configure shipping options for your customers
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Flat Rate Shipping */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <Truck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>Flat Rate Shipping</CardTitle>
                                <CardDescription>Charge a fixed shipping cost for all orders</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="flatRate-enabled" className="text-base">Enable Flat Rate Shipping</Label>
                            <Switch
                                id="flatRate-enabled"
                                checked={form.watch('flatRate.isEnabled')}
                                onCheckedChange={(c) => form.setValue('flatRate.isEnabled', c)}
                            />
                        </div>

                        {form.watch('flatRate.isEnabled') && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="flatRate-cost">Shipping Cost</Label>
                                    <Input
                                        id="flatRate-cost"
                                        type="number"
                                        step="0.01"
                                        placeholder="5.00"
                                        {...form.register('flatRate.cost')}
                                    />
                                    {form.formState.errors.flatRate?.cost && (
                                        <p className="text-sm text-destructive">{form.formState.errors.flatRate.cost.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="flatRate-description">Description (optional)</Label>
                                    <Input
                                        id="flatRate-description"
                                        placeholder="Standard flat rate shipping"
                                        {...form.register('flatRate.description')}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Free Shipping */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <Gift className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <CardTitle>Free Shipping</CardTitle>
                                <CardDescription>Offer free shipping when minimum order amount is met</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="freeShipping-enabled" className="text-base">Enable Free Shipping</Label>
                            <Switch
                                id="freeShipping-enabled"
                                checked={form.watch('freeShipping.isEnabled')}
                                onCheckedChange={(c) => form.setValue('freeShipping.isEnabled', c)}
                            />
                        </div>

                        {form.watch('freeShipping.isEnabled') && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="freeShipping-minAmount">Minimum Order Amount</Label>
                                    <Input
                                        id="freeShipping-minAmount"
                                        type="number"
                                        step="0.01"
                                        placeholder="50.00"
                                        {...form.register('freeShipping.minOrderAmount')}
                                    />
                                    {form.formState.errors.freeShipping?.minOrderAmount && (
                                        <p className="text-sm text-destructive">{form.formState.errors.freeShipping.minOrderAmount.message}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Free shipping will be available when cart total reaches this amount
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="freeShipping-description">Description (optional)</Label>
                                    <Input
                                        id="freeShipping-description"
                                        placeholder="Free shipping on orders over minimum amount"
                                        {...form.register('freeShipping.description')}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Local Pickup */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Store className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle>Local Pickup</CardTitle>
                                <CardDescription>Allow customers to pick up orders from your store</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="localPickup-enabled" className="text-base">Enable Local Pickup</Label>
                            <Switch
                                id="localPickup-enabled"
                                checked={form.watch('localPickup.isEnabled')}
                                onCheckedChange={(c) => form.setValue('localPickup.isEnabled', c)}
                            />
                        </div>

                        {form.watch('localPickup.isEnabled') && (
                            <div className="space-y-2">
                                <Label htmlFor="localPickup-description">Description (optional)</Label>
                                <Input
                                    id="localPickup-description"
                                    placeholder="Pick up from our store location"
                                    {...form.register('localPickup.description')}
                                />
                                <p className="text-xs text-muted-foreground">
                                    No shipping cost - customer collects in person
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving} size="lg">
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Shipping Settings
                    </Button>
                </div>
            </form>
        </div>
    );
}
