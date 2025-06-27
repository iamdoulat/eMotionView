
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface CdnProvider {
    id: string;
    name: string;
    description: string;
    fields: { id: string; label: string; placeholder: string; type: string }[];
}

const cdnProviders: CdnProvider[] = [
    {
        id: "cloudinary",
        name: "Cloudinary",
        description: "Image and video management solution.",
        fields: [
            { id: "cloud-name", label: "Cloud Name", placeholder: "your-cloud-name", type: "text" },
            { id: "api-key", label: "API Key", placeholder: "Your Cloudinary API Key", type: "text" },
            { id: "api-secret", label: "API Secret", placeholder: "Your Cloudinary API Secret", type: "password" },
        ],
    },
    {
        id: "cloudflare",
        name: "Cloudflare",
        description: "Web performance and security company.",
        fields: [
            { id: "account-id", label: "Account ID", placeholder: "Your Cloudflare Account ID", type: "text" },
            { id: "api-token", label: "API Token", placeholder: "Your Cloudflare API Token", type: "password" },
        ],
    },
    {
        id: "akamai",
        name: "Akamai",
        description: "Content delivery network and cloud services.",
         fields: [
            { id: "client-token", label: "Client Token", placeholder: "Your Akamai Client Token", type: "text" },
            { id: "client-secret", label: "Client Secret", placeholder: "Your Akamai Client Secret", type: "password" },
            { id: "access-token", label: "Access Token", placeholder: "Your Akamai Access Token", type: "password" },
        ],
    },
    {
        id: "bunnycdn",
        name: "BunnyCDN",
        description: "Affordable and fast content delivery.",
        fields: [
            { id: "pull-zone-name", label: "Pull Zone Name", placeholder: "your-pull-zone", type: "text" },
            { id: "api-key", label: "API Key (Storage)", placeholder: "Your BunnyCDN Storage API Key", type: "password" },
        ],
    },
    {
        id: "optimole",
        name: "Optimole",
        description: "All-in-one image optimization service.",
        fields: [
             { id: "api-key", label: "API Key", placeholder: "Your Optimole API Key", type: "password" },
        ],
    },
];

export default function CdnSettingsPage() {
    const [selectedProvider, setSelectedProvider] = useState<CdnProvider | null>(null);

    return (
        <Dialog onOpenChange={(open) => { if (!open) setSelectedProvider(null); }}>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold tracking-tight">Global CDN Settings</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>CDN Providers</CardTitle>
                        <CardDescription>Enable and configure the CDN services for your store assets.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {cdnProviders.map((provider) => (
                             <div key={provider.id} className="flex items-center justify-between p-4 border rounded-md">
                                <div>
                                    <Label htmlFor={`${provider.id}-cdn`} className="text-base font-medium">{provider.name}</Label>
                                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <DialogTrigger asChild>
                                        <Button variant="outline" onClick={() => setSelectedProvider(provider)}>Configure</Button>
                                    </DialogTrigger>
                                    <Switch id={`${provider.id}-cdn`} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                 <div className="flex justify-end">
                    <Button size="lg">Save All CDN Changes</Button>
                </div>
            </div>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configure {selectedProvider?.name}</DialogTitle>
                    <DialogDescription>
                        Enter your API credentials for {selectedProvider?.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {selectedProvider?.fields.map((field) => (
                         <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>{field.label}</Label>
                            <Input id={field.id} type={field.type} placeholder={field.placeholder} />
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setSelectedProvider(null)}>Cancel</Button>
                    <Button>Save Configuration</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
