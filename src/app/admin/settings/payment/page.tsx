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
    appKey: z.string().min(1, 'App Key is required'),
    appSecret: z.string().min(1, 'App Secret is required'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    isSandbox: z.boolean().default(true),
    isEnabled: z.boolean().default(false),
});

type BkashSettingsFormData = z.infer<typeof bkashSettingsSchema>;

const SETTINGS_DOC_PATH = 'admin_settings/bkash_payment';

export default function BkashPaymentSettingsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentSettings, setCurrentSettings] = useState<BkashSettings | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<BkashSettingsFormData>({
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

    const isSandbox = watch('isSandbox');
    const isEnabled = watch('isEnabled');

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const settingsRef = doc(db, 'admin_settings', 'bkash_payment');
                const docSnap = await getDoc(settingsRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as BkashSettings;
                    setCurrentSettings(data);
                    reset({
                        appKey: data.appKey || '',
                        appSecret: data.appSecret || '',
                        username: data.username || '',
                        password: data.password || '',
                        isSandbox: data.isSandbox ?? true,
                        isEnabled: data.isEnabled ?? false,
                    });
                }
            } catch (error) {
                console.error('Error fetching Bkash settings:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load Bkash settings',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [reset, toast]);

    const onSubmit = async (data: BkashSettingsFormData) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to save settings',
            });
            return;
        }

        setIsSaving(true);
        try {
            const baseURL = data.isSandbox
                ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
                : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

            const settingsData: BkashSettings = {
                appKey: data.appKey,
                appSecret: data.appSecret,
                username: data.username,
                password: data.password,
                isSandbox: data.isSandbox,
                isEnabled: data.isEnabled,
                baseURL,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid,
            };

            const settingsRef = doc(db, 'admin_settings', 'bkash_payment');
            await setDoc(settingsRef, settingsData);

            setCurrentSettings(settingsData);

            toast({
                title: 'Success',
                description: 'Bkash payment settings saved successfully',
            });
        } catch (error) {
            console.error('Error saving Bkash settings:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save Bkash settings',
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
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Bkash Payment Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Configure Bkash payment gateway credentials and settings
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Bkash API Credentials</CardTitle>
                        <CardDescription>
                            Enter your Bkash merchant credentials. Keep these secure and never share them publicly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="appKey">App Key</Label>
                            <Input
                                id="appKey"
                                type="text"
                                {...register('appKey')}
                                placeholder="Enter Bkash App Key"
                            />
                            {errors.appKey && (
                                <p className="text-sm text-destructive">{errors.appKey.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="appSecret">App Secret</Label>
                            <Input
                                id="appSecret"
                                type="password"
                                {...register('appSecret')}
                                placeholder="Enter Bkash App Secret"
                            />
                            {errors.appSecret && (
                                <p className="text-sm text-destructive">{errors.appSecret.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                {...register('username')}
                                placeholder="Enter Bkash Username"
                            />
                            {errors.username && (
                                <p className="text-sm text-destructive">{errors.username.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                                placeholder="Enter Bkash Password"
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isSandbox">Sandbox Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable sandbox mode for testing (recommended for development)
                                    </p>
                                </div>
                                <Switch
                                    id="isSandbox"
                                    checked={isSandbox}
                                    onCheckedChange={(checked) => setValue('isSandbox', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isEnabled">Enable Bkash Payment</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow customers to pay using Bkash during checkout
                                    </p>
                                </div>
                                <Switch
                                    id="isEnabled"
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => setValue('isEnabled', checked)}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Settings
                            </Button>
                        </div>

                        {currentSettings && (
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Base URL: <span className="font-mono text-foreground">{currentSettings.baseURL}</span>
                                </p>
                                {currentSettings.updatedAt && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Last updated: {new Date(currentSettings.updatedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
