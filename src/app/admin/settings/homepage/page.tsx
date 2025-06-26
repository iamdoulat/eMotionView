
"use client";

import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

// Data Structures
interface FeaturedCategory {
    id: string;
    name: string;
    image: string;
}
interface PromoBanner {
    id: string;
    image: string;
    link: string;
}
interface SingleBanner {
    image: string;
    link: string;
}
type SectionType = 'featured-categories' | 'product-grid' | 'promo-banner-pair' | 'single-banner-large';

interface Section {
    id: string;
    name: string;
    type: SectionType;
    content: any;
}


// Initial Data
const initialFeaturedCategoriesData: FeaturedCategory[] = [
    { id: 'fc1', name: 'Smart Watches', image: 'https://placehold.co/128x128.png' },
    { id: 'fc2', name: 'Headphones', image: 'https://placehold.co/128x128.png' },
    { id: 'fc3', name: 'Android Smart TVs', image: 'https://placehold.co/128x128.png' },
    { id: 'fc4', name: 'Charger & Cables', image: 'https://placehold.co/128x128.png' },
    { id: 'fc5', name: 'Powerbanks', image: 'https://placehold.co/128x128.png' },
];
const initialPromoBannersData: PromoBanner[] = [
    { id: 'promo1', image: 'https://placehold.co/800x400.png', link: '#' },
    { id: 'promo2', image: 'https://placehold.co/800x400.png', link: '#' },
];
const initialSmartWatchBannerData: SingleBanner = { image: 'https://placehold.co/1200x250.png', link: '/products?category=Wearables' };
const initialHeadphonesBannerData: SingleBanner = { image: 'https://placehold.co/1200x250.png', link: '/products?category=Audio' };

const initialSectionsData: Section[] = [
    { id: 'feat-cat', name: "Featured Categories", type: 'featured-categories', content: initialFeaturedCategoriesData },
    { id: 'new-arr', name: "New Arrivals", type: 'product-grid', content: null },
    { id: 'promo-ban', name: "Promotional Banners", type: 'promo-banner-pair', content: initialPromoBannersData },
    { id: 'pop-prod', name: "Popular Products", type: 'product-grid', content: null },
    { id: 'smart-watch', name: "Smart Watches", type: 'single-banner-large', content: initialSmartWatchBannerData },
    { id: 'headphones', name: "Headphones", type: 'single-banner-large', content: initialHeadphonesBannerData },
];


function SortableSectionItem({ 
    section,
    onSave,
    onDelete,
}: {
    section: Section;
    onSave: (updatedSection: Section) => void;
    onDelete: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
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

    const handleCategoryChange = (index: number, field: 'name', value: string) => {
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

    const handlePromoBannerChange = (index: number, field: 'link', value: string) => {
        const newContent = [...(editedSection.content as PromoBanner[])];
        newContent[index] = { ...newContent[index], [field]: value };
        setEditedSection(prev => ({ ...prev, content: newContent }));
    };

    const handleSingleBannerChange = (field: 'link', value: string) => {
        const newContent = { ...(editedSection.content as SingleBanner), [field]: value };
        setEditedSection(prev => ({ ...prev, content: newContent }));
    };

    const renderDialogContent = () => {
        switch (section.type) {
            case 'featured-categories':
                return (
                    <div className="space-y-4 py-4">
                        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
                            {(editedSection.content as FeaturedCategory[]).map((category, index) => (
                                <Card key={category.id} className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                        <div className="space-y-2">
                                            <Label htmlFor={`cat-name-${category.id}`}>Category Name</Label>
                                            <Input id={`cat-name-${category.id}`} value={category.name} onChange={(e) => handleCategoryChange(index, 'name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Current Image</Label>
                                            <div className="flex items-center gap-4">
                                                <Image src={category.image} alt={category.name} width={64} height={64} className="rounded-md border bg-secondary" data-ai-hint="category icon"/>
                                                <Input id={`cat-image-${category.id}`} type="file" className="max-w-xs"/>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
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
            case 'promo-banner-pair':
                return (
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">Recommended size: 800x400px</p>
                        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
                            {(editedSection.content as PromoBanner[]).map((banner, index) => (
                                <Card key={banner.id} className="p-4">
                                     <CardTitle className="text-lg mb-4">Banner {index + 1}</CardTitle>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        <div className="space-y-2">
                                            <Label>Current Image</Label>
                                            <div className="flex items-center gap-4">
                                                <Image src={banner.image} alt={`Banner ${index + 1}`} width={160} height={80} className="rounded-md border bg-secondary object-cover" data-ai-hint="promotional banner"/>
                                                <Input id={`promo-image-${banner.id}`} type="file" className="max-w-xs"/>
                                            </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>Current Image</Label>
                                    <div className="flex items-center gap-4">
                                        <Image src={(editedSection.content as SingleBanner)?.image || ''} alt={section.name} width={240} height={50} className="rounded-md border bg-secondary object-cover" data-ai-hint="advertisement banner"/>
                                        <Input id={`single-banner-image-${section.id}`} type="file" className="max-w-xs"/>
                                    </div>
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
                            <Input id="section-name" value={editedSection.name} onChange={(e) => handleNameChange(e.target.value)} />
                        </div>
                    </div>
                );
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <div ref={setNodeRef} style={style} {...attributes} className="flex items-center justify-between rounded-md border bg-background p-3 touch-none">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="cursor-grab" {...listeners}>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </Button>
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

export default function HomepageSettingsPage() {
  const [sections, setSections] = useState<Section[]>(initialSectionsData);
  const heroBanners = Array.from({ length: 5 });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleSaveSection = (updatedSection: Section) => {
    setSections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s));
  };
  
  const handleDeleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const handleAddNewSection = (type: SectionType) => {
    let newSection: Section;
    const id = `section-${Date.now()}`;
    switch (type) {
        case 'promo-banner-pair':
            newSection = {
                id,
                name: "New Promotional Banners",
                type: 'promo-banner-pair',
                content: [
                    { id: `promo1-${id}`, image: 'https://placehold.co/800x400.png', link: '#' },
                    { id: `promo2-${id}`, image: 'https://placehold.co/800x400.png', link: '#' },
                ]
            };
            break;
        case 'single-banner-large':
            newSection = {
                id,
                name: "New Large Banner",
                type: 'single-banner-large',
                content: { image: 'https://placehold.co/1200x250.png', link: '#' }
            };
            break;
        case 'featured-categories':
             newSection = {
                id,
                name: "New Featured Categories",
                type: 'featured-categories',
                content: []
            };
            break;
        case 'product-grid':
        default:
            newSection = {
                id,
                name: "New Content Section",
                type: 'product-grid',
                content: null
            };
            break;
    }
    setSections(prev => [...prev, newSection]);
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Homepage Design</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Hero Banners</CardTitle>
          <CardDescription>Manage the rotating banners at the top of your homepage. Configure up to 5.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            {heroBanners.map((_, index) => (
              <AccordionItem value={`item-${index + 1}`} key={index}>
                <AccordionTrigger>Hero Banner {index + 1}</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`hero-image-${index + 1}`}>Banner Image</Label>
                        <Input id={`hero-image-${index + 1}`} type="file" />
                        <p className="text-sm text-muted-foreground">Recommended size: 900x440px</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-headline-${index + 1}`}>Headline</Label>
                        <Input id={`hero-headline-${index + 1}`} placeholder="e.g. GADGET FEST" defaultValue={index === 0 ? "GADGET FEST" : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-subheadline-${index + 1}`}>Sub-headline</Label>
                        <Textarea id={`hero-subheadline-${index + 1}`} placeholder="e.g. Up to 60% off..." defaultValue={index === 0 ? "Up to 60% off on your favorite gadgets." : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-button-text-${index + 1}`}>Button Text</Label>
                        <Input id={`hero-button-text-${index + 1}`} placeholder="e.g. Shop Now" defaultValue={index === 0 ? "Shop Now" : ""} />
                      </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Sections</CardTitle>
          <CardDescription>Drag and drop to reorder the sections on your homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableSectionItem 
                    key={section.id} 
                    section={section}
                    onSave={handleSaveSection}
                    onDelete={() => handleDeleteSection(section.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <div className="mt-4 border-t pt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleAddNewSection('product-grid')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Content Section
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('promo-banner-pair')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Promo Banners (800x400)
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('single-banner-large')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Large Banner (1200x250)
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
          <Button size="lg">Save Changes</Button>
      </div>
    </div>
  );
}
