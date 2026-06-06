"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Database, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DatabaseSettingsPage() {
    const [mongoUri, setMongoUri] = useState("");
    const [mongoDb, setMongoDb] = useState("");
    const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        (async () => {
            let uri = '';
            let db = '';
            // Load from .env first
            try {
                const envRes = await fetch('/api/admin/load-env');
                const envData = await envRes.json();
                if (envData.success && envData.vars) {
                    if (envData.vars.MONGODB_URI) uri = envData.vars.MONGODB_URI;
                    if (envData.vars.MONGODB_DB) db = envData.vars.MONGODB_DB;
                }
            } catch {}
            // Fallback to MongoDB settings
            if (!uri) {
                try {
                    const res = await fetch('/api/data/settings?id=database');
                    const data = await res.json();
                    if (data.uri) uri = data.uri;
                    if (data.dbName) db = data.dbName;
                } catch {}
            }
            setMongoUri(uri);
            setMongoDb(db);
            if (uri) await runConnectionTest(uri, db);
        })();
    }, []);

    const runConnectionTest = async (uri: string, db: string) => {
        setIsTesting(true);
        try {
            const res = await fetch('/api/admin/test-db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uri, db }),
            });
            const data = await res.json();
            setConnectionStatus(data.success ? 'connected' : 'disconnected');
        } catch {
            setConnectionStatus('disconnected');
        } finally {
            setIsTesting(false);
        }
    };

    const testConnection = () => runConnectionTest(mongoUri, mongoDb);

    const saveConfig = async () => {
        setIsSaving(true);
        await fetch('/api/data/settings?id=database', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: 'database', uri: mongoUri, dbName: mongoDb }),
        });
        await fetch('/api/admin/save-env', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vars: { MONGODB_URI: mongoUri, MONGODB_DB: mongoDb } }),
        });
        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Database Settings</h1>
            <p className="text-muted-foreground">Configure MongoDB connection for the application.</p>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>MongoDB Connection</CardTitle>
                            <CardDescription>Set up your MongoDB database connection parameters.</CardDescription>
                        </div>
                        <Badge variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'disconnected' ? 'destructive' : 'secondary'}>
                            {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'disconnected' ? 'Disconnected' : 'Not Tested'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="mongo-uri">MongoDB URI</Label>
                        <Input
                            id="mongo-uri"
                            value={mongoUri}
                            onChange={(e) => setMongoUri(e.target.value)}
                            placeholder="mongodb://localhost:27017"
                        />
                        <p className="text-sm text-muted-foreground">The full MongoDB connection string.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mongo-db">Database Name</Label>
                        <Input
                            id="mongo-db"
                            value={mongoDb}
                            onChange={(e) => setMongoDb(e.target.value)}
                            placeholder="emotionview"
                        />
                    </div>
                    {connectionStatus === 'connected' && (
                        <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle>Connection Successful</AlertTitle>
                            <AlertDescription>Successfully connected to MongoDB.</AlertDescription>
                        </Alert>
                    )}
                    {connectionStatus === 'disconnected' && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Connection Failed</AlertTitle>
                            <AlertDescription>Could not connect to MongoDB. Please check your URI and try again.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="flex gap-4">
                    <Button variant="outline" onClick={testConnection} disabled={isTesting}>
                        {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Database className="mr-2 h-4 w-4" />
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
