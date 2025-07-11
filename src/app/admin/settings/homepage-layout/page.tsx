
"use client";

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { defaultHomepageSections, type Section, predefinedProductGrids } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const SETTINGS_DOC_PATH = 'public_content/homepage';

function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
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
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 bg-background p-4 border rounded-md shadow-sm">
      <button {...attributes} {...listeners} className="cursor-grab p-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      {children}
    </div>
  );
}

export default function HomepageLayoutPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSections = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, SETTINGS_DOC_PATH);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data()?.sections) {
          setSections(docSnap.data().sections);
        } else {
          setSections(defaultHomepageSections);
        }
      } catch (error) {
        console.error("Failed to fetch homepage sections:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load homepage layout.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSections();
  }, [toast]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSave = async (newOrder: Section[]) => {
      setIsSaving(true);
      try {
        const docRef = doc(db, SETTINGS_DOC_PATH);
        await setDoc(docRef, { sections: newOrder }, { merge: true });
        setSections(newOrder); // Update local state after successful save
        toast({ title: 'Layout Saved', description: 'Your homepage layout has been updated.' });
      } catch (error) {
        console.error("Error saving layout:", error);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the new layout.' });
      } finally {
          setIsSaving(false);
      }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id);
      const newIndex = sections.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(sections, oldIndex, newIndex);
      
      handleSave(newOrder);
    }
  };

  const handleAddNewSection = (section: Section) => {
    const newSection = {
        ...section,
        id: `${section.id}-${Date.now()}` // Ensure unique ID
    };
    const newSections = [...sections, newSection];
    handleSave(newSections);
  };

  const availableProductGrids = predefinedProductGrids.filter(
    (grid) => !sections.some((s) => s.id === grid.id)
  );


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Homepage Layout</CardTitle>
                <CardDescription>Drag and drop to reorder the sections on your homepage.</CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              {isSaving && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Saving...</div>}
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Section
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     {availableProductGrids.map(grid => (
                        <DropdownMenuItem key={grid.id} onClick={() => handleAddNewSection(grid)}>
                            Add "{grid.name}" Grid
                        </DropdownMenuItem>
                    ))}
                    {availableProductGrids.length === 0 && (
                        <DropdownMenuItem disabled>All product grids are in use.</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {sections.map((section) => (
                    <SortableItem key={section.id} id={section.id}>
                        <div className="flex-1">
                            <p className="font-medium">{section.name}</p>
                            <p className="text-sm text-muted-foreground">Type: {section.type}</p>
                        </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
