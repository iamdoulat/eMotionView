"use client";

import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

const initialSections = [
    { id: 'feat-cat', name: "Featured Categories" },
    { id: 'new-arr', name: "New Arrivals" },
    { id: 'promo-ban', name: "Promotional Banners" },
    { id: 'pop-prod', name: "Popular Products" },
    { id: 'smart-watch', name: "Smart Watches" },
    { id: 'headphones', name: "Headphones" },
];

function SortableSectionItem({ id, name }: { id: string, name: string }) {
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

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="flex items-center justify-between rounded-md border bg-background p-3 touch-none">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="cursor-grab" {...listeners}>
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </Button>
                <p className="font-medium">{name}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                </Button>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                </Button>
            </div>
        </div>
    );
}


export default function HomepageSettingsPage() {
  const [sections, setSections] = useState(initialSections);
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
                  <SortableSectionItem key={id} id={id} name={name} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
          <Button size="lg">Save Changes</Button>
      </div>
    </div>
  );
}
