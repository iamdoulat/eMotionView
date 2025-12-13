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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import type { BkashSettings, SSLCommerzSettings, CODSettings, StripeSettings, PayPalSettings, CurrencySettings, Currency } from '@/lib/placeholder-data';

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

const codSettingsSchema = z.object({
    isEnabled: z.boolean().default(false),
});

const stripeSettingsSchema = z.object({
    publishableKey: z.string().optional(),
    secretKey: z.string().optional(),
    isSandbox: z.boolean().default(true),
    isEnabled: z.boolean().default(false),
});

const paypalSettingsSchema = z.object({
    clientId: z.string().optional(),
    secret: z.string().optional(),
    isSandbox: z.boolean().default(true),
    isEnabled: z.boolean().default(false),
});

type BkashSettingsFormData = z.infer<typeof bkashSettingsSchema>;
type SSLCommerzSettingsFormData = z.infer<typeof sslcommerzSettingsSchema>;
type CODSettingsFormData = z.infer<typeof codSettingsSchema>;
type StripeSettingsFormData = z.infer<typeof stripeSettingsSchema>;
type PayPalSettingsFormData = z.infer<typeof paypalSettingsSchema>;

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

    // COD State
    const [isCODSaving, setIsCODSaving] = useState(false);
    const [codSettings, setCODSettings] = useState<CODSettings | null>(null);

    // Stripe State
    const [isStripeSaving, setIsStripeSaving] = useState(false);
    const [stripeSettings, setStripeSettings] = useState<StripeSettings | null>(null);

    // PayPal State
    const [isPayPalSaving, setIsPayPalSaving] = useState(false);
    const [paypalSettings, setPayPalSettings] = useState<PayPalSettings | null>(null);

    // Currency State
    const [isCurrencySaving, setIsCurrencySaving] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

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

    // COD Form
    const codForm = useForm<CODSettingsFormData>({
        resolver: zodResolver(codSettingsSchema),
        defaultValues: {
            isEnabled: false,
        },
    });

    // Stripe Form
    const stripeForm = useForm<StripeSettingsFormData>({
        resolver: zodResolver(stripeSettingsSchema),
        defaultValues: {
            publishableKey: '',
            secretKey: '',
            isSandbox: true,
            isEnabled: false,
        },
    });

    // PayPal Form
    const paypalForm = useForm<PayPalSettingsFormData>({
        resolver: zodResolver(paypalSettingsSchema),
        defaultValues: {
            clientId: '',
            secret: '',
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

                // Fetch COD Settings
                const codRef = doc(db, 'admin_settings', 'cod_payment');
                const codSnap = await getDoc(codRef);
                if (codSnap.exists()) {
                    const data = codSnap.data() as CODSettings;
                    setCODSettings(data);
                    codForm.reset({
                        isEnabled: data.isEnabled ?? false,
                    });
                }

                // Fetch Stripe Settings
                const stripeRef = doc(db, 'admin_settings', 'stripe_payment');
                const stripeSnap = await getDoc(stripeRef);
                if (stripeSnap.exists()) {
                    const data = stripeSnap.data() as StripeSettings;
                    setStripeSettings(data);
                    stripeForm.reset({
                        publishableKey: data.publishableKey || '',
                        secretKey: data.secretKey || '',
                        isSandbox: data.isSandbox ?? true,
                        isEnabled: data.isEnabled ?? false,
                    });
                }

                // Fetch PayPal Settings
                const paypalRef = doc(db, 'admin_settings', 'paypal_payment');
                const paypalSnap = await getDoc(paypalRef);
                if (paypalSnap.exists()) {
                    const data = paypalSnap.data() as PayPalSettings;
                    setPayPalSettings(data);
                    paypalForm.reset({
                        clientId: data.clientId || '',
                        secret: data.secret || '',
                        isSandbox: data.isSandbox ?? true,
                        isEnabled: data.isEnabled ?? false,
                    });
                }

                // Fetch Currency Settings
                const currencyRef = doc(db, 'admin_settings', 'currency');
                const currencySnap = await getDoc(currencyRef);
                if (currencySnap.exists()) {
                    const data = currencySnap.data() as CurrencySettings;
                    setSelectedCurrency(data.currency || 'USD');
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
    }, [toast, bkashForm, sslForm, codForm, stripeForm, paypalForm]);

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

    const onCODSubmit = async (data: CODSettingsFormData) => {
        if (!user) return;
        setIsCODSaving(true);
        try {
            const settingsData: CODSettings = {
                ...data,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid,
            };

            await setDoc(doc(db, 'admin_settings', 'cod_payment'), settingsData);
            setCODSettings(settingsData);
            toast({ title: 'Success', description: 'Cash on Delivery settings saved successfully' });
        } catch (error) {
            console.error('Error saving COD settings:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save COD settings' });
        } finally {
            setIsCODSaving(false);
        }
    };

    const onStripeSubmit = async (data: StripeSettingsFormData) => {
        if (!user) return;
        setIsStripeSaving(true);
        try {
            const settingsData: StripeSettings = {
                publishableKey: data.publishableKey || '',
                secretKey: data.secretKey || '',
                isSandbox: data.isSandbox,
                isEnabled: data.isEnabled,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid,
            };

            await setDoc(doc(db, 'admin_settings', 'stripe_payment'), settingsData);
            setStripeSettings(settingsData);
            toast({ title: 'Success', description: 'Stripe settings saved successfully' });
        } catch (error) {
            console.error('Error saving Stripe settings:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save Stripe settings' });
        } finally {
            setIsStripeSaving(false);
        }
    };

    const onPayPalSubmit = async (data: PayPalSettingsFormData) => {
        if (!user) return;
        setIsPayPalSaving(true);
        try {
            const settingsData: PayPalSettings = {
                clientId: data.clientId || '',
                secret: data.secret || '',
                isSandbox: data.isSandbox,
                isEnabled: data.isEnabled,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid,
            };

            await setDoc(doc(db, 'admin_settings', 'paypal_payment'), settingsData);
            setPayPalSettings(settingsData);
            toast({ title: 'Success', description: 'PayPal settings saved successfully' });
        } catch (error) {
            console.error('Error saving PayPal settings:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save PayPal settings' });
        } finally {
            setIsPayPalSaving(false);
        }
    };

    const onCurrencyChange = async (currency: Currency) => {
        if (!user) return;
        setIsCurrencySaving(true);
        setSelectedCurrency(currency);
        try {
            const settingsData: CurrencySettings = {
                currency,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid,
            };

            await setDoc(doc(db, 'admin_settings', 'currency'), settingsData);
            toast({ title: 'Success', description: `Currency changed to ${currency}` });
        } catch (error) {
            console.error('Error saving currency settings:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save currency settings' });
        } finally {
            setIsCurrencySaving(false);
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
                    Configure your payment gateways and currency
                </p>
            </div>

            {/* Currency Selector */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Currency Settings</CardTitle>
                    <CardDescription>Select the default currency for payments</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Label htmlFor="currency" className="min-w-[100px]">Currency</Label>
                        <Select value={selectedCurrency} onValueChange={onCurrencyChange} disabled={isCurrencySaving}>
                            <SelectTrigger id="currency" className="w-[200px]">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                                <SelectItem value="CAD">🇨🇦 CAD - Canadian Dollar</SelectItem>
                                <SelectItem value="BDT">🇧🇩 BDT - Bangladeshi Taka</SelectItem>
                            </SelectContent>
                        </Select>
                        {isCurrencySaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                </CardContent>
            </Card>

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

            {/* Cash on Delivery Settings */}
            <form onSubmit={codForm.handleSubmit(onCODSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">Cash on Delivery (COD)</CardTitle>
                        <CardDescription>Enable or disable COD payment method</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between pt-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Enable Cash on Delivery</Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow customers to pay in cash when their order is delivered
                                </p>
                            </div>
                            <Switch
                                checked={codForm.watch('isEnabled')}
                                onCheckedChange={(c) => codForm.setValue('isEnabled', c)}
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={isCODSaving} className="bg-green-600 hover:bg-green-700 text-white">
                                {isCODSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save COD Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* Stripe Settings */}
            <form onSubmit={stripeForm.handleSubmit(onStripeSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-purple-600">Stripe Payment Settings</CardTitle>
                        <CardDescription>Configure Stripe payment gateway</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Publishable Key</Label>
                                <Input type="text" {...stripeForm.register('publishableKey')} placeholder="pk_test_..." />
                                {stripeForm.formState.errors.publishableKey && <p className="text-sm text-destructive">{stripeForm.formState.errors.publishableKey.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Secret Key</Label>
                                <Input type="password" {...stripeForm.register('secretKey')} placeholder="sk_test_..." />
                                {stripeForm.formState.errors.secretKey && <p className="text-sm text-destructive">{stripeForm.formState.errors.secretKey.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={stripeForm.watch('isSandbox')}
                                    onCheckedChange={(c) => stripeForm.setValue('isSandbox', c)}
                                />
                                <Label>Test Mode</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={stripeForm.watch('isEnabled')}
                                    onCheckedChange={(c) => stripeForm.setValue('isEnabled', c)}
                                />
                                <Label>Enable Stripe</Label>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={isStripeSaving} className="bg-purple-600 hover:bg-purple-700 text-white">
                                {isStripeSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Stripe Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* PayPal Settings */}
            <form onSubmit={paypalForm.handleSubmit(onPayPalSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-blue-500">PayPal Payment Settings</CardTitle>
                        <CardDescription>Configure PayPal payment gateway</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Client ID</Label>
                                <Input type="text" {...paypalForm.register('clientId')} placeholder="Client ID" />
                                {paypalForm.formState.errors.clientId && <p className="text-sm text-destructive">{paypalForm.formState.errors.clientId.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Secret</Label>
                                <Input type="password" {...paypalForm.register('secret')} placeholder="Secret" />
                                {paypalForm.formState.errors.secret && <p className="text-sm text-destructive">{paypalForm.formState.errors.secret.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={paypalForm.watch('isSandbox')}
                                    onCheckedChange={(c) => paypalForm.setValue('isSandbox', c)}
                                />
                                <Label>Sandbox Mode</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={paypalForm.watch('isEnabled')}
                                    onCheckedChange={(c) => paypalForm.setValue('isEnabled', c)}
                                />
                                <Label>Enable PayPal</Label>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={isPayPalSaving} className="bg-blue-500 hover:bg-blue-600 text-white">
                                {isPayPalSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save PayPal Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
