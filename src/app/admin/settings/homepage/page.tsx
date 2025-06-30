
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, type SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, GripVertical, PlusCircle, Edit, Trash2, Upload, XCircle } from "lucide-react";
import { db, storage, docToJSON } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth, type UserRole } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { defaultHeroBanners, defaultHomepageSections, type Section, type HeroBanner } from '@/lib/placeholder-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const heroBannerSchema = z.object({
  image: z.union([z.instanceof(File), z.string()]),
  headline: z.string().min(1, 'Headline is required'),
  subheadline: z.string().min(1, 'Subheadline is required'),
  buttonText: z.string().min(1, 'Button text is required'),
  link: z.string().url('Must be a valid URL'),
});

const sectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Section name is required"),
  type: z.string(),
  content: z.any(),
});

const homepageSchema = z.object({
  heroBanners: z.array(heroBannerSchema),
  sections: z.array(sectionSchema),
});

type HomepageFormData = z.infer<typeof homepageSchema>;
type HeroBannerFormData = z.infer<typeof heroBannerSchema>;

const ADMIN_ROLES: UserRole[] = ['Admin', 'Manager'];


export default function HomepageSettingsPage() {
    const { user, role, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const [settings, setSettings] = useState<HomepageFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingHero, setIsEditingHero] = useState(false);
    
    const methods = useForm<HomepageFormData>();
    const { control, handleSubmit, reset } = methods;

    const { fields: sectionFields, move: moveSection } = useFieldArray({
        control,
        name: "sections",
    });

    const hasPermission = useMemo(() => role && ADMIN_ROLES.includes(role), [role]);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!hasPermission) {
                setSettings({ heroBanners: defaultHeroBanners, sections: defaultHomepageSections });
                reset({ heroBanners: defaultHeroBanners, sections: defaultHomepageSections });
                setIsLoading(false);
                return;
            }
            try {
                const docRef = doc(db, 'public_content', 'homepage');
                const docSnap = await getDoc(docRef);
                const data = docSnap.exists() ? docSnap.data() as HomepageFormData : { heroBanners: defaultHeroBanners, sections: defaultHomepageSections };
                setSettings(data);
                reset(data);
            } catch (error: any) {
                console.error("Failed to fetch homepage settings:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error Loading Settings',
                    description: `Could not load settings. ${error.message}`,
                });
                setSettings({ heroBanners: defaultHeroBanners, sections: defaultHomepageSections });
                reset({ heroBanners: defaultHeroBanners, sections: defaultHomepageSections });
            } finally {
                setIsLoading(false);
            }
        };

        if (!isAuthLoading) {
            fetchSettings();
        }
    }, [hasPermission, isAuthLoading, reset, toast]);
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 8,
          },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = sectionFields.findIndex((item) => item.id === active.id);
            const newIndex = sectionFields.findIndex((item) => item.id === over?.id);
            moveSection(oldIndex, newIndex);
        }
    };
    
    const onSubmit: SubmitHandler<HomepageFormData> = async (data) => {
        if (!hasPermission) {
            toast({
                variant: 'destructive',
                title: 'Permission Denied',
                description: 'You do not have permission to save settings.',
            });
            return;
        }
        setIsSaving(true);
        try {
            // Step 1: Handle Hero Banner Uploads and reconstruct banner objects
            const uploadedHeroBanners = await Promise.all(
                data.heroBanners.map(async (banner) => {
                    let imageUrl = banner.image as string;
                    if (banner.image instanceof File) {
                        try {
                            const sanitizedFilename = banner.image.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
                            const storageRef = ref(storage, `homepage/hero/${Date.now()}-${sanitizedFilename}`);
                            await uploadBytes(storageRef, banner.image);
                            imageUrl = await getDownloadURL(storageRef);
                        } catch (uploadError: any) {
                            console.error('Error uploading hero banner image:', uploadError);
                            throw new Error(`Storage upload failed: ${uploadError.code || uploadError.message}`);
                        }
                    }
                    // Reconstruct the banner object to ensure it's clean and only contains schema fields
                    return {
                        image: imageUrl,
                        headline: banner.headline,
                        subheadline: banner.subheadline,
                        buttonText: banner.buttonText,
                        link: banner.link,
                    };
                })
            );

            // Step 2: Prepare Final Data for Firestore by explicit reconstruction
            const finalDataForFirestore = {
                heroBanners: uploadedHeroBanners,
                sections: data.sections.map(section => ({
                    id: section.id,
                    name: section.name,
                    type: section.type,
                    content: section.content,
                })),
            };
            
            // Use JSON stringify and parse to strip any non-serializable data (like undefined, functions, etc.)
            const cleanedData = JSON.parse(JSON.stringify(finalDataForFirestore));

            // Step 3: Save to Firestore
            try {
                const docRef = doc(db, 'public_content', 'homepage');
                await setDoc(docRef, cleanedData);
            } catch (dbError: any) {
                console.error('Error saving layout to Firestore:', dbError);
                throw new Error(`Database save failed: ${dbError.code || dbError.message}`);
            }

            toast({ title: 'Success', description: 'Homepage settings saved successfully.' });
            
        } catch (error: any) {
            console.error("Error saving settings:", error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: `Could not save settings. ${error.message}`,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || isAuthLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }
    
    if (!hasPermission) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Permission Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTitle>Access Restricted</AlertTitle>
                        <AlertDescription>
                            You do not have the required permissions ('Admin' or 'Manager') to edit homepage settings.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Homepage Design</h1>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
                
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Hero Section</CardTitle>
                                <CardDescription>Manage the main hero banner on your homepage.</CardDescription>
                            </div>
                            <Dialog open={isEditingHero} onOpenChange={setIsEditingHero}>
                                <DialogTrigger asChild>
                                    <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Hero</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                    <HeroBannerForm onSave={() => setIsEditingHero(false)} />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Homepage Sections</CardTitle>
                        <CardDescription>Drag to reorder sections. Click to edit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={sectionFields} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                    {sectionFields.map((section, index) => (
                                        <SortableSection key={section.id} id={section.id} section={section} index={index} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </CardContent>
                </Card>
            </form>
        </FormProvider>
    );
}

function SortableSection({ id, section, index }: { id: string; section: any; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card className="flex items-center p-3 gap-3 bg-secondary/50">
                <button type="button" {...listeners} className="cursor-grab p-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className="flex-grow">
                    <p className="font-medium">{section.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{section.type.replace(/-/g, ' ')}</p>
                </div>
                {/* Edit functionality can be added here */}
            </Card>
        </div>
    );
}


function HeroBannerForm({ onSave }: { onSave: () => void }) {
    const { control, watch, setValue, getValues } = useFormContext<HomepageFormData>();
    const { fields, update } = useFieldArray({ control, name: "heroBanners" });

    // For simplicity, we'll edit the first hero banner. This can be expanded to a carousel editor.
    const bannerIndex = 0;
    const currentBanner = watch(`heroBanners.${bannerIndex}`);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setValue(`heroBanners.${bannerIndex}.image`, e.target.files[0]);
        }
    };
    
    return (
        <div>
            <DialogHeader>
                <DialogTitle>Edit Hero Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <div className="flex items-center gap-4">
                        <Image
                            src={currentBanner.image instanceof File ? URL.createObjectURL(currentBanner.image) : currentBanner.image}
                            alt="Banner preview"
                            width={100}
                            height={50}
                            className="rounded-md object-cover"
                        />
                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input id="headline" value={currentBanner.headline} onChange={e => setValue(`heroBanners.${bannerIndex}.headline`, e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="subheadline">Subheadline</Label>
                    <Textarea id="subheadline" value={currentBanner.subheadline} onChange={e => setValue(`heroBanners.${bannerIndex}.subheadline`, e.target.value)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input id="buttonText" value={currentBanner.buttonText} onChange={e => setValue(`heroBanners.${bannerIndex}.buttonText`, e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="link">Button Link</Label>
                        <Input id="link" value={currentBanner.link} onChange={e => setValue(`heroBanners.${bannerIndex}.link`, e.target.value)} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={onSave}>Done</Button>
            </DialogFooter>
        </div>
    );
}
