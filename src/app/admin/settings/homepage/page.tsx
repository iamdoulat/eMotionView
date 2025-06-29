
"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Section, SectionType } from "@/components/admin/homepage-section-item";
import { HomepageSectionItem } from "@/components/admin/homepage-section-item";


// Data Structures
interface HeroBanner {
    id: number;
    image: string;
    headline: string;
    subheadline: string;
    buttonText: string;
    link: string;
}

// Initial Data
const initialHeroBannersData: HeroBanner[] = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    image: `https://placehold.co/900x440.png`,
    headline: i === 0 ? "GADGET FEST" : "",
    subheadline: i === 0 ? "Up to 60% off on your favorite gadgets." : "",
    buttonText: i === 0 ? "Shop Now" : "",
    link: i === 0 ? "/products" : "#",
}));

const initialSectionsData: Section[] = [
    { id: 'feat-cat', name: "Featured Categories", type: 'featured-categories', content: [
        { id: 'fc1', name: 'Smart Watches', image: 'https://placehold.co/128x128.png' },
        { id: 'fc2', name: 'Headphones', image: 'https://placehold.co/128x128.png' },
        { id: 'fc3', name: 'Android Smart TVs', image: 'https://placehold.co/128x128.png' },
        { id: 'fc4', name: 'Charger & Cables', image: 'https://placehold.co/128x128.png' },
        { id: 'fc5', name: 'Powerbanks', image: 'https://placehold.co/128x128.png' },
    ]},
    { id: 'new-arr', name: "New Arrivals", type: 'product-grid', content: null },
    { id: 'promo-ban', name: "Promotional Banners", type: 'promo-banner-pair', content: [
        { id: 'promo1', image: 'https://placehold.co/800x400.png', link: '#' },
        { id: 'promo2', image: 'https://placehold.co/800x400.png', link: '#' },
    ] },
    { id: 'pop-prod', name: "Popular Products", type: 'product-grid', content: null },
    { id: 'smart-watch', name: "Smart Watches", type: 'single-banner-large', content: { image: 'https://placehold.co/1200x250.png', link: '/products?category=Wearables' } },
    { id: 'headphones', name: "Headphones", type: 'single-banner-large', content: { image: 'https://placehold.co/1200x250.png', link: '/products?category=Audio' } },
];


export default function HomepageSettingsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "homepage");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHeroBanners(data.heroBanners || initialHeroBannersData);
          setSections(data.sections || initialSectionsData);
        } else {
          setHeroBanners(initialHeroBannersData);
          setSections(initialSectionsData);
        }
      } catch (error) {
        console.error("Failed to fetch homepage settings:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not load homepage settings." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);
  
  const handleHeroBannerChange = (index: number, field: keyof HeroBanner, value: string) => {
    const newBanners = [...heroBanners];
    (newBanners[index] as any)[field] = value;
    setHeroBanners(newBanners);
  };

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
        case 'promo-banner-trio':
             newSection = {
                id,
                name: "New Triple Banners",
                type: 'promo-banner-trio',
                content: [
                    { id: `promo1-${id}`, image: 'https://placehold.co/400x200.png', link: '#' },
                    { id: `promo2-${id}`, image: 'https://placehold.co/400x200.png', link: '#' },
                    { id: `promo3-${id}`, image: 'https://placehold.co/400x200.png', link: '#' },
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
        case 'one-column-banner':
            newSection = {
                id,
                name: "New 1-Column Banner",
                type: 'one-column-banner',
                content: [{ id: `promo-${id}`, image: 'https://placehold.co/1200x400.png', link: '#' }]
            };
            break;
        case 'two-column-banner':
            newSection = {
                id,
                name: "New 2-Column Banners",
                type: 'two-column-banner',
                content: [
                    { id: `promo1-${id}`, image: 'https://placehold.co/600x400.png', link: '#' },
                    { id: `promo2-${id}`, image: 'https://placehold.co/600x400.png', link: '#' },
                ]
            };
            break;
        case 'three-column-banner':
            newSection = {
                id,
                name: "New 3-Column Banners",
                type: 'three-column-banner',
                content: [
                    { id: `promo1-${id}`, image: 'https://placehold.co/400x400.png', link: '#' },
                    { id: `promo2-${id}`, image: 'https://placehold.co/400x400.png', link: '#' },
                    { id: `promo3-${id}`, image: 'https://placehold.co/400x400.png', link: '#' },
                ]
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
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsRef = doc(db, "settings", "homepage");
      await setDoc(settingsRef, { heroBanners, sections });
      toast({
        title: "Success",
        description: "Homepage settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving homepage settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
      return (
          <div className="space-y-8">
              <h1 className="text-3xl font-bold tracking-tight">Homepage Design</h1>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
               <div className="flex justify-end">
                  <Skeleton className="h-12 w-36" />
              </div>
          </div>
      )
  }

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
            {heroBanners.map((banner, index) => (
              <AccordionItem value={`item-${banner.id}`} key={banner.id}>
                <AccordionTrigger>Hero Banner {index + 1}</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`hero-image-${banner.id}`}>Banner Image URL</Label>
                        <Input id={`hero-image-${banner.id}`} value={banner.image} onChange={(e) => handleHeroBannerChange(index, 'image', e.target.value)} />
                        <p className="text-sm text-muted-foreground">Recommended size: 900x440px</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-headline-${banner.id}`}>Headline</Label>
                        <Input id={`hero-headline-${banner.id}`} value={banner.headline} onChange={(e) => handleHeroBannerChange(index, 'headline', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-subheadline-${banner.id}`}>Sub-headline</Label>
                        <Textarea id={`hero-subheadline-${banner.id}`} value={banner.subheadline} onChange={(e) => handleHeroBannerChange(index, 'subheadline', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-button-text-${banner.id}`}>Button Text</Label>
                        <Input id={`hero-button-text-${banner.id}`} value={banner.buttonText} onChange={(e) => handleHeroBannerChange(index, 'buttonText', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-link-${banner.id}`}>Button Link</Label>
                        <Input id={`hero-link-${banner.id}`} value={banner.link} onChange={(e) => handleHeroBannerChange(index, 'link', e.target.value)} />
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
                  <HomepageSectionItem 
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
             <Button variant="outline" onClick={() => handleAddNewSection('promo-banner-trio')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Triple Banners
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('promo-banner-pair')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Paired Banners
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('single-banner-large')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Large Banner
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('one-column-banner')}>
              <Plus className="mr-2 h-4 w-4" />
              Add 1-Column Banner
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('two-column-banner')}>
              <Plus className="mr-2 h-4 w-4" />
              Add 2-Column Banners
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('three-column-banner')}>
              <Plus className="mr-2 h-4 w-4" />
              Add 3-Column Banners
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
          <Button size="lg" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
      </div>
    </div>
  );
}
