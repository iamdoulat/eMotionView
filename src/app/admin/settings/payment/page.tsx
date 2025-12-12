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
import { Loader2 } from 'lucide-react';
import type { BkashSettings, SSLCommerzSettings } from '@/lib/placeholder-data';

const bkashSettingsSchema = z.object({
    appKey: z.string().min(1, 'App Key is required'),
    appSecret: z.string().min(1, 'App Secret is required'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    isSandbox: z.boolean().default(true),
    isEnabled: z.boolean().default(false),
});

const sslcommerzSettingsSchema = z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    storePassword: z.string().min(1, 'Store Password is required'),
    isSandbox: z.boolean().default(true),
    isEnabled: z.boolean().default(false),
});

type BkashSettingsFormData = z.infer<typeof bkashSettingsSchema>;
type SSLCommerzSettingsFormData = z.infer<typeof sslcommerzSettingsSchema>;

export default function PaymentSettingsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Bkash State
    const [isBkashSaving, setIsBkashSaving] = useState(false);
    const [bkashSettings, setBkashSettings] = useState<BkashSettings | null>(null);

    // SSLCommerz State
    const [isSSLSaving, setIsSSLSaving] = useState(false);
    const [sslSettings, setSSLSettings] = useState<SSLCommerzSettings | null>(null);

    // Bkash Form
    const bkashForm = useForm<BkashSettingsFormData>({
        resolver: zodResolver(bkashSettingsSchema),
        defaultValues: {
            appKey: '',
            appSecret: '',
            username: '',
            password: '',
            isSandbox: true,
            isEnabled: false,
        },
    });

    // SSLCommerz Form
    const sslForm = useForm<SSLCommerzSettingsFormData>({
        resolver: zodResolver(sslcommerzSettingsSchema),
        defaultValues: {
            storeId: '',
            storePassword: '',
            isSandbox: true,
            isEnabled: false,
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                // Fetch Bkash Settings
                const bkashRef = doc(db, 'admin_settings', 'bkash_payment');
                const bkashSnap = await getDoc(bkashRef);
                if (bkashSnap.exists()) {
                    const data = bkashSnap.data() as BkashSettings;
                    setBkashSettings(data);
                    bkashForm.reset({
                        appKey: data.appKey || '',
                        appSecret: data.appSecret || '',
                        username: data.username || '',
                        password: data.password || '',
                        isSandbox: data.isSandbox ?? true,
                        isEnabled: data.isEnabled ?? false,
                    });
                }

                // Fetch SSLCommerz Settings
                const sslRef = doc(db, 'admin_settings', 'sslcommerz_payment');
                const sslSnap = await getDoc(sslRef);
                if (sslSnap.exists()) {
                    const data = sslSnap.data() as SSLCommerzSettings;
                    setSSLSettings(data);
                    sslForm.reset({
                        storeId: data.storeId || '',
                        storePassword: data.storePassword || '',
                        isSandbox: data.isSandbox ?? true,
                        isEnabled: data.isEnabled ?? false,
                    });
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load payment settings',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [toast, bkashForm, sslForm]);

    const onBkashSubmit = async (data: BkashSettingsFormData) => {
        if (!user) return;
        setIsBkashSaving(true);
        try {
            const baseURL = data.isSandbox
                ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
                : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

            const settingsData: BkashSettings = {
                ...data,
                baseURL,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid,
            };

            await setDoc(doc(db, 'admin_settings', 'bkash_payment'), settingsData);
            setBkashSettings(settingsData);
            toast({ title: 'Success', description: 'Bkash settings saved successfully' });
        } catch (error) {
            console.error('Error saving Bkash settings:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save Bkash settings' });
        } finally {
            setIsBkashSaving(false);
        }
    };

    const onSSLSubmit = async (data: SSLCommerzSettingsFormData) => {
        if (!user) return;
        setIsSSLSaving(true);
        try {
            const settingsData: SSLCommerzSettings = {
                ...data,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid,
            };

            await setDoc(doc(db, 'admin_settings', 'sslcommerz_payment'), settingsData);
            setSSLSettings(settingsData);
            toast({ title: 'Success', description: 'SSLCommerz settings saved successfully' });
        } catch (error) {
            console.error('Error saving SSLCommerz settings:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save SSLCommerz settings' });
        } finally {
            setIsSSLSaving(false);
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
                <h1 className="text-3xl font-bold">Payment Gateway Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Configure your payment gateways
                </p>
            </div>

            {/* Bkash Settings */}
            <form onSubmit={bkashForm.handleSubmit(onBkashSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-pink-600">bKash Payment Settings</CardTitle>
                        <CardDescription>API v1.2.0-beta configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>App Key</Label>
                                <Input type="text" {...bkashForm.register('appKey')} placeholder="App Key" />
                                {bkashForm.formState.errors.appKey && <p className="text-sm text-destructive">{bkashForm.formState.errors.appKey.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>App Secret</Label>
                                <Input type="password" {...bkashForm.register('appSecret')} placeholder="App Secret" />
                                {bkashForm.formState.errors.appSecret && <p className="text-sm text-destructive">{bkashForm.formState.errors.appSecret.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <Input type="text" {...bkashForm.register('username')} placeholder="Username" />
                                {bkashForm.formState.errors.username && <p className="text-sm text-destructive">{bkashForm.formState.errors.username.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input type="password" {...bkashForm.register('password')} placeholder="Password" />
                                {bkashForm.formState.errors.password && <p className="text-sm text-destructive">{bkashForm.formState.errors.password.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={bkashForm.watch('isSandbox')}
                                    onCheckedChange={(c) => bkashForm.setValue('isSandbox', c)}
                                />
                                <Label>Sandbox Mode</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={bkashForm.watch('isEnabled')}
                                    onCheckedChange={(c) => bkashForm.setValue('isEnabled', c)}
                                />
                                <Label>Enable bKash</Label>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={isBkashSaving} className="bg-pink-600 hover:bg-pink-700 text-white">
                                {isBkashSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save bKash Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* SSLCommerz Settings */}
            <form onSubmit={sslForm.handleSubmit(onSSLSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-blue-600">SSLCommerz Settings</CardTitle>
                        <CardDescription>Payment gateway configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Store ID</Label>
                                <Input type="text" {...sslForm.register('storeId')} placeholder="Store ID" />
                                {sslForm.formState.errors.storeId && <p className="text-sm text-destructive">{sslForm.formState.errors.storeId.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Store Password</Label>
                                <Input type="password" {...sslForm.register('storePassword')} placeholder="Store Password" />
                                {sslForm.formState.errors.storePassword && <p className="text-sm text-destructive">{sslForm.formState.errors.storePassword.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={sslForm.watch('isSandbox')}
                                    onCheckedChange={(c) => sslForm.setValue('isSandbox', c)}
                                />
                                <Label>Sandbox Mode</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={sslForm.watch('isEnabled')}
                                    onCheckedChange={(c) => sslForm.setValue('isEnabled', c)}
                                />
                                <Label>Enable SSLCommerz</Label>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={isSSLSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isSSLSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save SSLCommerz Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
