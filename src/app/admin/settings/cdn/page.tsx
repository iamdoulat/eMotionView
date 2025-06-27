
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ExternalLink, Info } from "lucide-react";

interface CdnProvider {
    id: 'cloudinary' | 'cloudflare' | 'akamai' | 'bunnycdn' | 'optimole';
    name: string;
    description: string;
    docsUrl: string;
    envVars: { key: string; description: string }[];
}

const cdnProviders: CdnProvider[] = [
    {
        id: "cloudinary",
        name: "Cloudinary",
        description: "Robust image and video management solution.",
        docsUrl: "https://next.cloudinary.dev/installation",
        envVars: [
            { key: 'CLOUDINARY_CLOUD_NAME', description: 'Your Cloudinary cloud name.' },
            { key: 'CLOUDINARY_API_KEY', description: 'Your Cloudinary API key.' },
            { key: 'CLOUDINARY_API_SECRET', description: 'Your Cloudinary API secret.' },
        ],
    },
    {
        id: "optimole",
        name: "Optimole",
        description: "All-in-one image optimization service.",
        docsUrl: "https://docs.optimole.com/article/2244-setting-up-secure-authentication-for-optimole-api",
        envVars: [
             { key: 'OPTIMOLE_API_KEY', description: 'Your Optimole API key for secure authentication.' },
        ],
    },
    {
        id: "cloudflare",
        name: "Cloudflare",
        description: "Global network for web performance and security.",
        docsUrl: "https://developers.cloudflare.com/images/",
        envVars: [
            { key: 'CLOUDFLARE_ACCOUNT_ID', description: 'Your Cloudflare Account ID.' },
            { key: 'CLOUDFLARE_API_TOKEN', description: 'Your Cloudflare API Token for Images.' },
        ],
    },
    {
        id: "akamai",
        name: "Akamai",
        description: "Enterprise-grade content delivery network.",
        docsUrl: "https://www.akamai.com/products/image-and-video-manager",
         envVars: [
            { key: 'AKAMAI_CLIENT_TOKEN', description: 'Your Akamai Client Token.' },
            { key: 'AKAMAI_CLIENT_SECRET', description: 'Your Akamai Client Secret.' },
            { key: 'AKAMAI_ACCESS_TOKEN', description: 'Your Akamai Access Token.' },
        ],
    },
    {
        id: "bunnycdn",
        name: "BunnyCDN",
        description: "Affordable and fast content delivery.",
        docsUrl: "https://bunny.net/cdn/",
        envVars: [
            { key: 'BUNNYCDN_PULL_ZONE_NAME', description: 'Your BunnyCDN Pull Zone name.' },
            { key: 'BUNNYCDN_API_KEY', description: 'Your BunnyCDN Storage API Key.' },
        ],
    },
];

type CdnStatus = Record<CdnProvider['id'], boolean>;

export default function CdnSettingsPage() {
    const [selectedProvider, setSelectedProvider] = useState<CdnProvider | null>(null);
    const [cdnStatus, setCdnStatus] = useState<CdnStatus>({
        cloudinary: false,
        cloudflare: false,
        akamai: false,
        bunnycdn: false,
        optimole: false,
    });
    const { toast } = useToast();

    const handleSwitchChange = (providerId: CdnProvider['id'], checked: boolean) => {
        setCdnStatus(prev => ({ ...prev, [providerId]: checked }));
        if (checked) {
            toast({
                title: `${cdnProviders.find(p=>p.id===providerId)?.name} Enabled`,
                description: "Don't forget to configure and save your settings.",
            })
        }
    };
    
    const handleSave = () => {
         toast({
            title: "Settings Saved",
            description: "Your CDN preferences have been saved. A server restart may be required for .env changes to take effect.",
        });
    };

    return (
        <Dialog onOpenChange={(open) => { if (!open) setSelectedProvider(null); }}>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold tracking-tight">Global CDN Settings</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>CDN Providers</CardTitle>
                        <CardDescription>Enable and configure CDN services for your store assets. Configuration is done via environment variables.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {cdnProviders.map((provider) => (
                             <div key={provider.id} className="flex items-center justify-between p-4 border rounded-md">
                                <div>
                                    <label htmlFor={`${provider.id}-cdn`} className="text-base font-medium">{provider.name}</label>
                                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <DialogTrigger asChild>
                                        <Button variant="outline" onClick={() => setSelectedProvider(provider)}>
                                            <Info className="mr-2 h-4 w-4" />
                                            Instructions
                                        </Button>
                                    </DialogTrigger>
                                    <Switch 
                                        id={`${provider.id}-cdn`} 
                                        checked={cdnStatus[provider.id]}
                                        onCheckedChange={(checked) => handleSwitchChange(provider.id, checked)}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                 <div className="flex justify-end">
                    <Button size="lg" onClick={handleSave}>Save All CDN Changes</Button>
                </div>
            </div>

            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Configuration Instructions for {selectedProvider?.name}</DialogTitle>
                    <DialogDescription>
                        To use {selectedProvider?.name}, you need to set the following environment variables in your <strong>.env</strong> file.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                   <p className="text-sm text-muted-foreground">After updating your .env file, you must restart your development server for the changes to apply.</p>
                   {selectedProvider?.envVars.map((envVar) => (
                       <div key={envVar.key} className="p-3 rounded-md border bg-secondary/50">
                           <p className="font-mono text-sm font-semibold text-primary">{envVar.key}</p>
                           <p className="text-sm text-muted-foreground mt-1">{envVar.description}</p>
                       </div>
                   ))}
                   <Button asChild variant="link" className="px-0">
                       <Link href={selectedProvider?.docsUrl || '#'} target="_blank">
                           Read Documentation
                           <ExternalLink className="ml-2 h-4 w-4" />
                       </Link>
                   </Button>
                </div>
                <DialogFooter>
                    <DialogTrigger asChild>
                        <Button>Close</Button>
                    </DialogTrigger>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
