
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardTitle } from "../ui/card";

// Data Structures
export interface FeaturedCategory {
    id: string;
    name: string;
    image: string;
}
export interface PromoBanner {
    id: string;
    image: string;
    link: string;
}
export interface SingleBanner {
    image: string;
    link: string;
}
export type SectionType = 
    | 'featured-categories' 
    | 'product-grid' 
    | 'promo-banner-pair' 
    | 'single-banner-large' 
    | 'promo-banner-trio'
    | 'one-column-banner'
    | 'two-column-banner'
    | 'three-column-banner';

export interface Section {
    id: string;
    name: string;
    type: SectionType;
    content: any;
}

export function HomepageSectionItem({ 
    section,
    onSave,
    onDelete,
}: {
    section: Section;
    onSave: (updatedSection: Section) => void;
    onDelete: () => void;
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editedSection, setEditedSection] = useState<Section>(section);
    
    const handleOpenChange = (open: boolean) => {
        if (open) {
            setEditedSection(JSON.parse(JSON.stringify(section))); 
        }
        setIsDialogOpen(open);
    }

    const handleSave = () => {
        onSave(editedSection);
        setIsDialogOpen(false);
    }
    
    const handleNameChange = (newName: string) => {
        setEditedSection(prev => ({ ...prev, name: newName }));
    };

    const handleCategoryChange = (index: number, field: keyof FeaturedCategory, value: string) => {
        const newContent = [...(editedSection.content as FeaturedCategory[])];
        newContent[index] = { ...newContent[index], [field]: value };
        setEditedSection(prev => ({ ...prev, content: newContent }));
    };

    const handleAddCategory = () => {
        const newContent = [...(editedSection.content as FeaturedCategory[]), { id: `new-${Date.now()}`, name: 'New Category', image: 'https://placehold.co/128x128.png' }];
        setEditedSection(prev => ({...prev, content: newContent}));
    };
    
    const handleRemoveCategory = (categoryId: string) => {
        const newContent = (editedSection.content as FeaturedCategory[]).filter(c => c.id !== categoryId);
        setEditedSection(prev => ({...prev, content: newContent}));
    };

    const handlePromoBannerChange = (index: number, field: keyof PromoBanner, value: string) => {
        const newContent = [...(editedSection.content as PromoBanner[])];
        newContent[index] = { ...newContent[index], [field]: value };
        setEditedSection(prev => ({ ...prev, content: newContent }));
    };

    const handleSingleBannerChange = (field: keyof SingleBanner, value: string) => {
        const newContent = { ...(editedSection.content as SingleBanner), [field]: value };
        setEditedSection(prev => ({ ...prev, content: newContent }));
    };
    
    const isProductGrid = section.type === 'product-grid';

    const renderDialogContent = () => {
        switch (section.type) {
            case 'featured-categories':
                return (
                    <div className="space-y-4 py-4">
                        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
                            {(editedSection.content as FeaturedCategory[]).map((category, index) => (
                                <Card key={category.id} className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        <div className="space-y-2">
                                            <Label htmlFor={`cat-name-${category.id}`}>Category Name</Label>
                                            <Input id={`cat-name-${category.id}`} value={category.name} onChange={(e) => handleCategoryChange(index, 'name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`cat-image-${category.id}`}>Image URL</Label>
                                            <Input id={`cat-image-${category.id}`} value={category.image} onChange={(e) => handleCategoryChange(index, 'image', e.target.value)} />
                                        </div>
                                        <div className="col-span-full flex justify-end">
                                            <Button variant="destructive" size="icon" onClick={() => handleRemoveCategory(category.id)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete Category</span>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                         <Button variant="outline" onClick={handleAddCategory}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Category
                        </Button>
                    </div>
                );
            case 'promo-banner-trio':
            case 'promo-banner-pair':
            case 'one-column-banner':
            case 'two-column-banner':
            case 'three-column-banner':
                 let size = '800x400px';
                 if (section.type === 'promo-banner-trio') size = '400x200px';
                 if (section.type === 'one-column-banner') size = '1200x400px';
                 if (section.type === 'two-column-banner') size = '600x400px';
                 if (section.type === 'three-column-banner') size = '400x400px';

                 return (
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">Recommended size: {size}</p>
                        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
                            {(editedSection.content as PromoBanner[]).map((banner, index) => (
                                <Card key={banner.id} className="p-4">
                                     <CardTitle className="text-lg mb-4">Banner {index + 1}</CardTitle>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`promo-image-${banner.id}`}>Image URL</Label>
                                            <Input id={`promo-image-${banner.id}`} value={banner.image} onChange={(e) => handlePromoBannerChange(index, 'image', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`promo-link-${banner.id}`}>Link URL</Label>
                                            <Input id={`promo-link-${banner.id}`} value={banner.link} onChange={(e) => handlePromoBannerChange(index, 'link', e.target.value)} />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            case 'single-banner-large':
                return (
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">Recommended size: 1200x250px</p>
                        <Card className="p-4">
                           <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`single-banner-image-${section.id}`}>Image URL</Label>
                                    <Input id={`single-banner-image-${section.id}`} value={(editedSection.content as SingleBanner)?.image || ''} onChange={(e) => handleSingleBannerChange('image', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`single-banner-link-${section.id}`}>Link URL</Label>
                                    <Input id={`single-banner-link-${section.id}`} value={(editedSection.content as SingleBanner)?.link || ''} onChange={(e) => handleSingleBannerChange('link', e.target.value)} />
                                </div>
                            </div>
                        </Card>
                    </div>
                );
            case 'product-grid':
            default:
                return (
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="section-name">Section Title</Label>
                            <Input id="section-name" value={editedSection.name} onChange={(e) => handleNameChange(e.target.value)} disabled={isProductGrid} />
                            {isProductGrid && <p className="text-sm text-muted-foreground">Product grid titles like "New Arrivals" are fixed and cannot be changed.</p>}
                        </div>
                    </div>
                );
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <div className="flex items-center justify-between rounded-md border bg-background p-3 touch-none">
                <div className="flex items-center gap-3">
                    <p className="font-medium">{section.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                    </DialogTrigger>
                    <Button variant="destructive" size="icon" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            </div>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Edit Section: {section.name}</DialogTitle>
                    <DialogDescription>
                        Make changes to this homepage section. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                {renderDialogContent()}
                <DialogFooter>
                     <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
