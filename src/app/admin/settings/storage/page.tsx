"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, HardDrive, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

export default function StorageSettingsPage() {
    const [endpoint, setEndpoint] = useState("");
    const [accessKey, setAccessKey] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [bucket, setBucket] = useState("");
    const [publicUrl, setPublicUrl] = useState("");
    const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        (async () => {
            let ep = '';
            let ak = '';
            let sk = '';
            let bu = '';
            let pu = '';
            // Load from .env first
            try {
                const envRes = await fetch('/api/admin/load-env');
                const envData = await envRes.json();
                if (envData.success && envData.vars) {
                    if (envData.vars.R2_ENDPOINT) ep = envData.vars.R2_ENDPOINT;
                    if (envData.vars.R2_ACCESS_KEY) ak = envData.vars.R2_ACCESS_KEY;
                    if (envData.vars.R2_SECRET_KEY) sk = envData.vars.R2_SECRET_KEY;
                    if (envData.vars.R2_BUCKET) bu = envData.vars.R2_BUCKET;
                    if (envData.vars.R2_PUBLIC_URL) pu = envData.vars.R2_PUBLIC_URL;
                }
            } catch {}
            // Fallback to MongoDB settings
            if (!ep) {
                try {
                    const res = await fetch('/api/data/settings?id=storage');
                    const data = await res.json();
                    if (data.endpoint) ep = data.endpoint;
                    if (data.accessKey) ak = data.accessKey;
                    if (data.secretKey) sk = data.secretKey;
                    if (data.bucket) bu = data.bucket;
                    if (data.publicUrl) pu = data.publicUrl;
                } catch {}
            }
            setEndpoint(ep);
            setAccessKey(ak);
            setSecretKey(sk);
            setBucket(bu);
            setPublicUrl(pu);
            if (ep) await runConnectionTest(ep, ak, sk, bu, pu);
        })();
    }, []);

    const runConnectionTest = async (ep: string, ak: string, sk: string, bu: string, pu: string) => {
        setIsTesting(true);
        try {
            const res = await fetch('/api/admin/test-storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: ep, accessKey: ak, secretKey: sk, bucket: bu, publicUrl: pu }),
            });
            const data = await res.json();
            setConnectionStatus(data.success ? 'connected' : 'disconnected');
        } catch {
            setConnectionStatus('disconnected');
        } finally {
            setIsTesting(false);
        }
    };

    const testConnection = () => runConnectionTest(endpoint, accessKey, secretKey, bucket, publicUrl);

    const saveConfig = async () => {
        setIsSaving(true);
        await fetch('/api/data/settings?id=storage', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: 'storage', endpoint, accessKey, secretKey, bucket, publicUrl }),
        });
        await fetch('/api/admin/save-env', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint, accessKey, secretKey, bucket, publicUrl }),
        });
        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Storage Settings</h1>
            <p className="text-muted-foreground">Configure Cloudflare R2 storage for file uploads.</p>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Cloudflare R2 Configuration</CardTitle>
                            <CardDescription>Set up your R2-compatible object storage.</CardDescription>
                        </div>
                        <Badge variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'disconnected' ? 'destructive' : 'secondary'}>
                            {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'disconnected' ? 'Error' : 'Not Tested'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="r2-endpoint">R2 Endpoint URL</Label>
                        <Input id="r2-endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://<accountid>.r2.cloudflarestorage.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="r2-access-key">Access Key ID</Label>
                            <Input id="r2-access-key" type="password" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="r2-secret-key">Secret Access Key</Label>
                            <Input id="r2-secret-key" type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="r2-bucket">Bucket Name</Label>
                            <Input id="r2-bucket" value={bucket} onChange={(e) => setBucket(e.target.value)} placeholder="emotionview" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="r2-public-url">Public URL (optional)</Label>
                            <Input id="r2-public-url" value={publicUrl} onChange={(e) => setPublicUrl(e.target.value)} placeholder="https://pub-<hash>.r2.dev" />
                        </div>
                    </div>
                    {connectionStatus === 'connected' && (
                        <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle>Connection Successful</AlertTitle>
                            <AlertDescription>Successfully connected to Cloudflare R2.</AlertDescription>
                        </Alert>
                    )}
                    {connectionStatus === 'disconnected' && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Connection Failed</AlertTitle>
                            <AlertDescription>Could not connect to R2. Please check your credentials.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="flex gap-4">
                    <Button variant="outline" onClick={testConnection} disabled={isTesting}>
                        {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <HardDrive className="mr-2 h-4 w-4" />
                        Test Connection
                    </Button>
                    <Button onClick={saveConfig} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Configuration
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
