"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Activity } from 'lucide-react';

interface TrackingSettings {
    gtmId: string;
    gtmEnabled: boolean;
    gaId: string;
    gaEnabled: boolean;
    fbPixelId: string;
    fbPixelEnabled: boolean;
}

const defaultSettings: TrackingSettings = {
    gtmId: '',
    gtmEnabled: false,
    gaId: '',
    gaEnabled: false,
    fbPixelId: '',
    fbPixelEnabled: false,
};

export default function TrackingSettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [settings, setSettings] = useState<TrackingSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const settingsRef = doc(db, 'settings', 'tracking');
            const settingsSnap = await getDoc(settingsRef);

            if (settingsSnap.exists()) {
                setSettings({ ...defaultSettings, ...settingsSnap.data() });
            }
        } catch (error) {
            console.error('Failed to fetch tracking settings:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load tracking settings',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const validateSettings = (): boolean => {
        // GTM validation
        if (settings.gtmEnabled && !settings.gtmId) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Google Tag Manager ID is required when enabled',
            });
            return false;
        }
        if (settings.gtmId && !settings.gtmId.startsWith('GTM-')) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Invalid GTM format (expected GTM-XXXXXXX)',
            });
            return false;
        }

        // GA validation
        if (settings.gaEnabled && !settings.gaId) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Google Analytics ID is required when enabled',
            });
            return false;
        }
        if (settings.gaId && !settings.gaId.startsWith('G-')) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Invalid GA format (expected G-XXXXXXXXXX)',
            });
            return false;
        }

        // FB Pixel validation
        if (settings.fbPixelEnabled && !settings.fbPixelId) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Facebook Pixel ID is required when enabled',
            });
            return false;
        }
        if (settings.fbPixelId && !/^\d+$/.test(settings.fbPixelId)) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Facebook Pixel ID must be numeric',
            });
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateSettings()) return;

        setIsSaving(true);
        try {
            const settingsRef = doc(db, 'settings', 'tracking');
            await setDoc(settingsRef, {
                ...settings,
                updatedAt: new Date().toISOString(),
                updatedBy: user?.uid || 'unknown',
            });

            toast({
                title: 'Success',
                description: 'Tracking settings saved successfully. Refresh the page to apply changes.',
            });
        } catch (error) {
            console.error('Failed to save tracking settings:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save tracking settings',
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tracking & Analytics</h1>
                <p className="text-muted-foreground">
                    Configure Google Tag Manager, Google Analytics, and Facebook Pixel tracking
                </p>
            </div>

            {/* Google Tag Manager */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Google Tag Manager</CardTitle>
                            <CardDescription>
                                Centralized tag management system for all tracking codes
                            </CardDescription>
                        </div>
                        <Switch
                            checked={settings.gtmEnabled}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, gtmEnabled: checked })
                            }
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="gtmId">Container ID</Label>
                        <Input
                            id="gtmId"
                            placeholder="GTM-XXXXXXX"
                            value={settings.gtmId}
                            onChange={(e) => setSettings({ ...settings, gtmId: e.target.value })}
                            disabled={!settings.gtmEnabled}
                        />
                        <p className="text-sm text-muted-foreground">
                            Format: GTM-XXXXXXX (e.g., GTM-ABC123)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Google Analytics */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Google Analytics 4</CardTitle>
                            <CardDescription>
                                Track website traffic and user behavior
                            </CardDescription>
                        </div>
                        <Switch
                            checked={settings.gaEnabled}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, gaEnabled: checked })
                            }
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="gaId">Measurement ID</Label>
                        <Input
                            id="gaId"
                            placeholder="G-XXXXXXXXXX"
                            value={settings.gaId}
                            onChange={(e) => setSettings({ ...settings, gaId: e.target.value })}
                            disabled={!settings.gaEnabled}
                        />
                        <p className="text-sm text-muted-foreground">
                            Format: G-XXXXXXXXXX (e.g., G-ABC1234567)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Facebook Pixel */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Facebook Pixel</CardTitle>
                            <CardDescription>
                                Track conversions and optimize Facebook ads
                            </CardDescription>
                        </div>
                        <Switch
                            checked={settings.fbPixelEnabled}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, fbPixelEnabled: checked })
                            }
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fbPixelId">Pixel ID</Label>
                        <Input
                            id="fbPixelId"
                            placeholder="1234567890"
                            value={settings.fbPixelId}
                            onChange={(e) => setSettings({ ...settings, fbPixelId: e.target.value })}
                            disabled={!settings.fbPixelEnabled}
                        />
                        <p className="text-sm text-muted-foreground">
                            Format: Numeric (e.g., 1234567890123456)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Settings
                </Button>
            </div>

            {/* Info Box */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Important Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-900 space-y-2">
                    <p>• Changes require a page refresh to take effect</p>
                    <p>• You can enable/disable tracking services individually</p>
                    <p>• IDs are validated before saving</p>
                    <p>• Consider privacy regulations (GDPR, CCPA) when using tracking</p>
                    <p>• Test tracking using browser developer tools or platform preview modes</p>
                </CardContent>
            </Card>
        </div>
    );
}
