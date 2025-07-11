
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
import { db, storage } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { defaultHomepageSections, type Section, predefinedProductGrids, type Category, type PromoBanner, type SingleBanner } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
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

const predefinedSections: Section[] = [
    { id: 'featured-categories-tpl', name: "Featured Categories Carousel", type: 'featured-categories', content: defaultHomepageSections.find(s => s.type === 'featured-categories')?.content || [] },
    { id: 'promo-banner-pair-tpl', name: "Promo Banner Pair (800x400)", type: 'promo-banner-pair', content: defaultHomepageSections.find(s => s.type === 'promo-banner-pair')?.content || [] },
    { id: 'single-banner-large-tpl', name: "Single Banner Large (1200x150)", type: 'single-banner-large', content: defaultHomepageSections.find(s => s.type === 'single-banner-large')?.content || {} },
];


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
  
  // State for the edit dialog
  const [editedName, setEditedName] = useState("");
  const [editedLink, setEditedLink] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
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
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load homepage layout or categories. Check Firestore rules.' });
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

  const handleAddNewSection = (section: Section, category?: string) => {
    let newSection = {
        ...section,
        id: `${section.type}-${Date.now()}` // Ensure unique ID
    };

    if (section.type === 'product-grid' && category) {
      newSection.name = `${category} Products`;
      newSection.content = { category: category };
    }

    const newSections = [...sections, newSection];
    handleSave(newSections, `Added new section: ${newSection.name}.`);
  };


  const handleOpenEditDialog = (section: Section) => {
    setSectionToEdit(section);
    setEditedName(section.name);
    
    if (section.type === 'product-grid') {
        setSelectedCategory(section.content?.category || "");
    } else if (section.type === 'single-banner-large') {
        setEditedLink(section.content?.link || "");
    }

    setIsFormOpen(true);
  };
  
  const handleUpdateSection = async () => {
    if (!sectionToEdit) return;
    setIsSaving(true);

    let updatedContent = sectionToEdit.content;

    // Handle image upload if a new file is present
    if (newImageFile && sectionToEdit.type === 'single-banner-large') {
        try {
            const storageRef = ref(storage, `homepage/banners/${Date.now()}-${newImageFile.name}`);
            const uploadResult = await uploadBytes(storageRef, newImageFile);
            const imageUrl = await getDownloadURL(uploadResult.ref);
            updatedContent = { ...updatedContent, image: imageUrl };
        } catch (error) {
            console.error("Error uploading image:", error);
            toast({ variant: 'destructive', title: 'Image Upload Failed', description: 'Could not upload the new image.' });
            setIsSaving(false);
            return;
        }
    }

    // Prepare updated data based on section type
    let updatedSectionData: Partial<Section> = { name: editedName.trim() };
    if (sectionToEdit.type === 'product-grid') {
        if (!selectedCategory) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a category.' });
            setIsSaving(false);
            return;
        }
        updatedSectionData.content = { category: selectedCategory };
    } else if (sectionToEdit.type === 'single-banner-large') {
        updatedSectionData.content = { ...updatedContent, link: editedLink };
    }

    const updatedSections = sections.map(s => 
        s.id === sectionToEdit.id ? { ...s, ...updatedSectionData } : s
    );

    await handleSave(updatedSections, `Section "${editedName.trim()}" updated.`);
    
    // Reset form state and close dialog
    setIsFormOpen(false);
    setSectionToEdit(null);
    setNewImageFile(null);
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
                    <DropdownMenuContent align="end">
                        <DropdownMenuSub>
                           <DropdownMenuSubTrigger>Product Grid</DropdownMenuSubTrigger>
                           <DropdownMenuPortal>
                               <DropdownMenuSubContent>
                                   {productCategories.map(cat => (
                                       <DropdownMenuItem key={cat.id} onClick={() => handleAddNewSection(predefinedProductGrids[0], cat.name)}>
                                           Add "{cat.name}" Grid
                                       </DropdownMenuItem>
                                   ))}
                               </DropdownMenuSubContent>
                           </DropdownMenuPortal>
                        </DropdownMenuSub>
                        {predefinedSections.map(section => (
                            <DropdownMenuItem key={section.id} onClick={() => handleAddNewSection(section)}>
                                {section.name}
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
          ) : sections.length > 0 ? (
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
          ) : (
             <div className="text-center py-12 text-muted-foreground">No sections found. Add one to get started.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
              <div className="space-y-2">
                    <Label htmlFor="section-name">Section Name</Label>
                    <Input
                        id="section-name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="mt-2"
                    />
                </div>
            {sectionToEdit?.type === 'product-grid' && (
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
            )}
             {sectionToEdit?.type === 'single-banner-large' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="banner-link">Banner Link</Label>
                        <Input
                            id="banner-link"
                            value={editedLink}
                            onChange={(e) => setEditedLink(e.target.value)}
                            placeholder="e.g., /products/some-product"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="banner-image">New Banner Image (Optional)</Label>
                        <Input
                            id="banner-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                        />
                    </div>
                    {sectionToEdit.content.image && (
                         <div>
                            <Label>Current Image</Label>
                            <Image 
                                src={sectionToEdit.content.image} 
                                alt="Current banner image" 
                                width={120} 
                                height={15} 
                                className="mt-2 rounded-md border object-cover" 
                            />
                        </div>
                    )}
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSection} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
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
