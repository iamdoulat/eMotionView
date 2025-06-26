
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

const initialSectionsData = [
    { id: 'feat-cat', name: "Featured Categories" },
    { id: 'new-arr', name: "New Arrivals" },
    { id: 'promo-ban', name: "Promotional Banners" },
    { id: 'pop-prod', name: "Popular Products" },
    { id: 'smart-watch', name: "Smart Watches" },
    { id: 'headphones', name: "Headphones" },
];

interface FeaturedCategory {
    id: string;
    name: string;
    image: string;
}

const initialFeaturedCategoriesData: FeaturedCategory[] = [
    { id: 'fc1', name: 'Smart Watches', image: 'https://placehold.co/128x128.png' },
    { id: 'fc2', name: 'Headphones', image: 'https://placehold.co/128x128.png' },
    { id: 'fc3', name: 'Android Smart TVs', image: 'https://placehold.co/128x128.png' },
    { id: 'fc4', name: 'Charger & Cables', image: 'https://placehold.co/128x128.png' },
    { id: 'fc5', name: 'Powerbanks', image: 'https://placehold.co/128x128.png' },
];

interface SortableSectionItemProps {
    id: string;
    name: string;
    featuredCategories?: FeaturedCategory[];
    onSaveFeaturedCategories?: (categories: FeaturedCategory[]) => void;
    onSaveSectionName?: (newName: string) => void;
    onDelete?: () => void;
}

function SortableSectionItem({ id, name, featuredCategories = [], onSaveFeaturedCategories, onSaveSectionName, onDelete }: SortableSectionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editedName, setEditedName] = useState(name);
    const [editedCategories, setEditedCategories] = useState<FeaturedCategory[]>([]);
    
    const handleOpenChange = (open: boolean) => {
        if (open) {
            // Reset local state when dialog opens
            setEditedName(name);
            setEditedCategories(JSON.parse(JSON.stringify(featuredCategories))); // Deep copy
        }
        setIsDialogOpen(open);
    }

    const handleSave = () => {
        if (id === 'feat-cat') {
            onSaveFeaturedCategories?.(editedCategories);
        } else {
            onSaveSectionName?.(editedName);
        }
        setIsDialogOpen(false);
    }
    
    const handleCategoryChange = (index: number, field: 'name', value: string) => {
        const newCategories = [...editedCategories];
        newCategories[index] = { ...newCategories[index], [field]: value };
        setEditedCategories(newCategories);
    };

    const handleAddCategory = () => {
        setEditedCategories([...editedCategories, { id: `new-${Date.now()}`, name: 'New Category', image: 'https://placehold.co/128x128.png' }]);
    };
    
    const handleRemoveCategory = (categoryId: string) => {
        setEditedCategories(editedCategories.filter(c => c.id !== categoryId));
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <div ref={setNodeRef} style={style} {...attributes} className="flex items-center justify-between rounded-md border bg-background p-3 touch-none">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="cursor-grab" {...listeners}>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <p className="font-medium">{name}</p>
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
                    <DialogTitle>Edit Section: {name}</DialogTitle>
                    <DialogDescription>
                        Make changes to this homepage section. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                {id === 'feat-cat' ? (
                    <div className="space-y-4 py-4">
                        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
                            {editedCategories.map((category, index) => (
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
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="section-name">Section Title</Label>
                            <Input id="section-name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                        </div>
                    </div>
                )}
                <DialogFooter>
                     <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function HomepageSettingsPage() {
  const [sections, setSections] = useState(initialSectionsData);
  const [featuredCategories, setFeaturedCategories] = useState(initialFeaturedCategoriesData);
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

  const handleSaveSectionName = (id: string, newName: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };
  
  const handleDeleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const handleAddNewSection = () => {
    const newSection = {
      id: `new-section-${Date.now()}`,
      name: "New Section",
    };
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
                {sections.map(({id, name}) => (
                  <SortableSectionItem 
                    key={id} 
                    id={id} 
                    name={name}
                    featuredCategories={featuredCategories}
                    onSaveFeaturedCategories={setFeaturedCategories}
                    onSaveSectionName={(newName) => handleSaveSectionName(id, newName)}
                    onDelete={() => handleDeleteSection(id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <div className="mt-4 border-t pt-4">
            <Button variant="outline" onClick={handleAddNewSection}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Section
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
