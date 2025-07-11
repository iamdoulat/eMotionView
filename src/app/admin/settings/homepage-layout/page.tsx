
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
import { GripVertical, Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { defaultHomepageSections, type Section, predefinedProductGrids, type Category } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      <div {...attributes} {...listeners} className="cursor-grab p-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

export default function HomepageLayoutPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
  const [editedName, setEditedName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sectionsDocRef = doc(db, SETTINGS_DOC_PATH);
        const categoriesCollectionRef = collection(db, 'categories');

        const [sectionsSnap, categoriesSnap] = await Promise.all([
            getDoc(sectionsDocRef),
            getDocs(categoriesCollectionRef)
        ]);
        
        if (sectionsSnap.exists() && sectionsSnap.data()?.sections) {
          setSections(sectionsSnap.data().sections);
        } else {
          setSections(defaultHomepageSections);
        }
        
        const categoryList = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setProductCategories(categoryList);

      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load homepage layout or categories.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSave = async (newSections: Section[], successMessage: string) => {
      setIsSaving(true);
      try {
        const docRef = doc(db, SETTINGS_DOC_PATH);
        await setDoc(docRef, { sections: newSections }, { merge: true });
        setSections(newSections); // Update local state after successful save
        toast({ title: 'Success', description: successMessage });
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
      
      handleSave(newOrder, 'Homepage layout reordered.');
    }
  };

  const handleAddNewSection = (section: Section) => {
    const newSection = {
        ...section,
        id: `${section.id}-${Date.now()}` // Ensure unique ID
    };
    const newSections = [...sections, newSection];
    handleSave(newSections, `Added new section: ${newSection.name}.`);
  };

  const availableProductGrids = predefinedProductGrids.filter(
    (grid) => !sections.some((s) => s.id === grid.id)
  );

  const handleOpenEditDialog = (section: Section) => {
    setSectionToEdit(section);
    if (section.type === 'product-grid') {
        setSelectedCategory(section.content?.category || "");
        setEditedName("");
    } else {
        setEditedName(section.name);
        setSelectedCategory("");
    }
    setIsFormOpen(true);
  };
  
  const handleUpdateSection = async () => {
    if (!sectionToEdit) return;

    let updatedSectionData: Partial<Section> = {};
    let successMessage = "";

    if (sectionToEdit.type === 'product-grid') {
      if (!selectedCategory) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a category.' });
        return;
      }
      const categoryName = productCategories.find(c => c.name === selectedCategory)?.name || "Products";
      updatedSectionData = {
          name: `Product Grid: ${categoryName}`,
          content: { category: selectedCategory }
      };
      successMessage = `Product grid updated to show ${categoryName}.`;
    } else {
      if (!editedName.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Section name cannot be empty.' });
        return;
      }
      updatedSectionData = { name: editedName.trim() };
      successMessage = `Section "${editedName.trim()}" updated.`;
    }

    const updatedSections = sections.map(s => 
      s.id === sectionToEdit.id ? { ...s, ...updatedSectionData } : s
    );
    await handleSave(updatedSections, successMessage);
    setIsFormOpen(false);
    setSectionToEdit(null);
  };
  
  const handleDeleteSection = async () => {
    if (!sectionToDelete) return;
    const updatedSections = sections.filter(s => s.id !== sectionToDelete.id);
    await handleSave(updatedSections, `Section "${sectionToDelete.name}" deleted.`);
    setSectionToDelete(null);
  };

  return (
    <>
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
                      {predefinedProductGrids.map(grid => (
                          <DropdownMenuItem key={grid.id} onClick={() => handleAddNewSection(grid)}>
                              Add "{grid.name}" Grid
                          </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
              <div className="space-y-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
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
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(section)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setSectionToDelete(section)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {sectionToEdit?.type === 'product-grid' ? (
                <div className="space-y-2">
                    <Label>Product Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {productCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="section-name">Section Name</Label>
                    <Input
                    id="section-name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="mt-2"
                    />
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSection}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the "{sectionToDelete?.name}" section from your homepage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSection} className="bg-destructive hover:bg-destructive/90">Delete Section</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
