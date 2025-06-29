
"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { HeroBanner } from '@/lib/placeholder-data';

export function HeroBannerItem({
    banner,
    onDelete,
    onChange,
}: {
    banner: HeroBanner;
    onDelete: () => void;
    onChange: (id: number, field: keyof HeroBanner, value: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: banner.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleChange = (field: keyof HeroBanner, value: string) => {
        onChange(banner.id, field, value);
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <AccordionItem value={`item-${banner.id}`} className="bg-background rounded-lg border">
                <div className="flex items-center p-2">
                    <Button variant="ghost" size="icon" className="cursor-grab touch-none" {...listeners}>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </Button>
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
                        <Label htmlFor={`hero-image-${banner.id}`}>Banner Image URL</Label>
                        <Input id={`hero-image-${banner.id}`} value={banner.image} onChange={(e) => handleChange('image', e.target.value)} />
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
