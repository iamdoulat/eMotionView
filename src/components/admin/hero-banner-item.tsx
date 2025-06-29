
"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { HeroBanner } from '@/lib/placeholder-data';
import Image from "next/image";

export function HeroBannerItem({
    banner,
    onDelete,
    onChange,
    onFileChange,
}: {
    banner: HeroBanner;
    onDelete: () => void;
    onChange: (id: number, field: keyof HeroBanner, value: string) => void;
    onFileChange: (id: number, file: File) => void;
}) {

    const handleChange = (field: keyof HeroBanner, value: string) => {
        onChange(banner.id, field, value);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileChange(banner.id, file);
            const previewUrl = URL.createObjectURL(file);
            onChange(banner.id, 'image', previewUrl);
        }
    };

    return (
        <div>
            <AccordionItem value={`item-${banner.id}`} className="bg-background rounded-lg border">
                <div className="flex items-center p-2">
                    <AccordionTrigger className="flex-1 text-left p-2 hover:no-underline">
                        <span>{banner.headline || `Banner ${banner.id}`}</span>
                    </AccordionTrigger>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete banner</span>
                    </Button>
                </div>
                <AccordionContent>
                    <div className="grid gap-4 pt-2 p-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor={`hero-image-${banner.id}`}>Banner Image</Label>
                        <div className="flex items-center gap-4">
                           <Image src={banner.image || 'https://placehold.co/128x50.png'} width={128} height={50} alt="Banner preview" className="rounded-md border object-contain aspect-video" />
                           <Input id={`hero-image-upload-${banner.id}`} type="file" accept="image/*" onChange={handleFileSelect} className="block" />
                        </div>
                        <p className="text-sm text-muted-foreground">Recommended size: 900x440px</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-headline-${banner.id}`}>Headline</Label>
                        <Input id={`hero-headline-${banner.id}`} value={banner.headline} onChange={(e) => handleChange('headline', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-subheadline-${banner.id}`}>Sub-headline</Label>
                        <Textarea id={`hero-subheadline-${banner.id}`} value={banner.subheadline} onChange={(e) => handleChange('subheadline', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-button-text-${banner.id}`}>Button Text</Label>
                        <Input id={`hero-button-text-${banner.id}`} value={banner.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-link-${banner.id}`}>Button Link</Label>
                        <Input id={`hero-link-${banner.id}`} value={banner.link} onChange={(e) => handleChange('link', e.target.value)} />
                      </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </div>
    );
}
