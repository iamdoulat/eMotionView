
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, type SubmitHandler, FormProvider, type UseFormReturn, Controller } from 'react-hook-form';
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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, GripVertical, PlusCircle, Edit, Trash2 } from "lucide-react";
import { db, storage, docToJSON } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth, type UserRole } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { defaultHeroBanners, defaultHomepageSections, defaultFooterSettings, type Section, type FooterSettings } from '@/lib/placeholder-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';


const heroBannerSchema = z.object({
  id: z.number().optional(),
  image: z.union([z.instanceof(File), z.string()]).optional(),
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

const footerSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  socialLinks: z.object({
    facebook: z.string().url().or(z.literal('#')).or(z.literal('')),
    twitter: z.string().url().or(z.literal('#')).or(z.literal('')),
    instagram: z.string().url().or(z.literal('#')).or(z.literal('')),
    linkedin: z.string().url().or(z.literal('#')).or(z.literal('')),
    youtube: z.string().url().or(z.literal('#')).or(z.literal('')),
  }),
  companyLinks: z.array(z.object({
    label: z.string().min(1, 'Label is required'),
    href: z.string().min(1, 'Link is required'),
  })),
  contact: z.object({
    address: z.string().min(1, 'Address is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email'),
  })
});

const homepageSchema = z.object({
  heroBanners: z.array(heroBannerSchema),
  sections: z.array(sectionSchema),
  footer: footerSchema,
});

type HomepageFormData = z.infer<typeof homepageSchema>;

const ADMIN_ROLES: UserRole[] = ['Admin', 'Manager'];


export default function HomepageSettingsPage() {
    const { user, role, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const [settings, setSettings] = useState<HomepageFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingHero, setIsEditingHero] = useState(false);
    const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
    const [isEditingFooter, setIsEditingFooter] = useState(false);
    
    const methods = useForm<HomepageFormData>({
        resolver: zodResolver(homepageSchema)
    });
    const { control, handleSubmit, reset } = methods;

    const { fields: sectionFields, move: moveSection } = useFieldArray({
        control,
        name: "sections",
    });

    const hasPermission = useMemo(() => role && ADMIN_ROLES.includes(role), [role]);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!hasPermission) {
                const defaultData = { heroBanners: defaultHeroBanners, sections: defaultHomepageSections, footer: defaultFooterSettings };
                setSettings(defaultData);
                reset(defaultData);
                setIsLoading(false);
                return;
            }
            try {
                const docRef = doc(db, 'public_content', 'homepage');
                const docSnap = await getDoc(docRef);
                const data = docSnap.exists() ? docToJSON(docSnap) as HomepageFormData : { heroBanners: defaultHeroBanners, sections: defaultHomepageSections, footer: defaultFooterSettings };
                if (!data.footer) data.footer = defaultFooterSettings;
                setSettings(data);
                reset(data);
            } catch (error: any) {
                console.error("Failed to fetch homepage settings:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error Loading Settings',
                    description: `Could not load settings. ${error.message || 'Missing or insufficient permissions.'}`,
                });
                const defaultData = { heroBanners: defaultHeroBanners, sections: defaultHomepageSections, footer: defaultFooterSettings };
                setSettings(defaultData);
                reset(defaultData);
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
            const uploadImage = async (file: File, path: string) => {
                const storageRef = ref(storage, `${path}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`);
                await uploadBytes(storageRef, file);
                return getDownloadURL(storageRef);
            };

            const processedHeroBanners = await Promise.all(
                (data.heroBanners || []).map(async (banner) => {
                    if (banner.image instanceof File) {
                        const imageUrl = await uploadImage(banner.image, 'homepage/hero');
                        return { ...banner, image: imageUrl };
                    }
                    return banner;
                })
            );

            const processedSections = await Promise.all(
                (data.sections || []).map(async (section) => {
                    if (!section.content || typeof section.content !== 'object') return section;

                    if (Array.isArray(section.content)) {
                        const processedContent = await Promise.all(
                            section.content.map(async (item: any) => {
                                if (item && item.image instanceof File) {
                                    const imageUrl = await uploadImage(item.image, `homepage/sections`);
                                    return { ...item, image: imageUrl };
                                }
                                return item;
                            })
                        );
                        return { ...section, content: processedContent };
                    } else if (section.content.image instanceof File) {
                        const imageUrl = await uploadImage(section.content.image, `homepage/sections`);
                        return { ...section, content: { ...section.content, image: imageUrl } };
                    }
                    return section;
                })
            );
            
            const dataToSave = {
                heroBanners: processedHeroBanners || [],
                sections: processedSections || [],
                footer: data.footer || defaultFooterSettings,
            };
            
            const cleanedData = JSON.parse(JSON.stringify(dataToSave));

            const docRef = doc(db, 'public_content', 'homepage');
            await setDoc(docRef, cleanedData, { merge: true });

            toast({ title: 'Success', description: 'Homepage settings saved successfully.' });
        } catch (error: any) {
            console.error("Error saving settings to Firestore:", error);
            const errorMessage = error.code === 'permission-denied'
                ? 'Permission denied. Please check your Firestore security rules.'
                : `Could not save settings. ${error.message}`;

            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: errorMessage,
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
                                    <HeroBannerForm
                                      methods={methods}
                                      onSave={() => setIsEditingHero(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Homepage Sections</CardTitle>
                        <CardDescription>Drag to reorder sections. Click to edit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={sectionFields} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                    {sectionFields.map((section, index) => (
                                        <SortableSection 
                                            key={section.id} 
                                            id={section.id} 
                                            section={section} 
                                            onEdit={() => setEditingSectionIndex(index)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Footer Section</CardTitle>
                                <CardDescription>Manage the content of your site's footer.</CardDescription>
                            </div>
                            <Dialog open={isEditingFooter} onOpenChange={setIsEditingFooter}>
                                <DialogTrigger asChild>
                                    <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Footer</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                    <FooterForm
                                        methods={methods}
                                        onSave={() => setIsEditingFooter(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                </Card>
            </form>
            <Dialog open={editingSectionIndex !== null} onOpenChange={(open) => !open && setEditingSectionIndex(null)}>
                <DialogContent className="sm:max-w-3xl">
                    {editingSectionIndex !== null && (
                        <SectionEditor
                            methods={methods}
                            sectionIndex={editingSectionIndex}
                            onClose={() => setEditingSectionIndex(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </FormProvider>
    );
}

function SortableSection({ id, section, onEdit }: { id: string; section: any; onEdit: () => void; }) {
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
                 <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Section</span>
                </Button>
            </Card>
        </div>
    );
}

function ImageField({ value, onChange, previewSize = { width: 200, height: 100 } }: { value?: string | File; onChange: (file: File) => void; previewSize?: {width: number, height: number} }) {
    const [previewSrc, setPreviewSrc] = useState<string>(`https://placehold.co/${previewSize.width}x${previewSize.height}.png`);

    useEffect(() => {
        if (typeof value === 'string' && value) {
            setPreviewSrc(value);
        } else if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreviewSrc(url);
            return () => URL.revokeObjectURL(url);
        } else {
             setPreviewSrc(`https://placehold.co/${previewSize.width}x${previewSize.height}.png`);
        }
    }, [value, previewSize]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onChange(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-2">
            <Image src={previewSrc} alt="Banner Preview" width={previewSize.width} height={previewSize.height} className="rounded-md object-cover border" />
            <Input type="file" accept="image/*" onChange={handleFileChange} className="text-xs" />
        </div>
    );
}

function SectionEditor({ methods, sectionIndex, onClose }: { methods: UseFormReturn<HomepageFormData>, sectionIndex: number, onClose: () => void }) {
    const { control, register, watch } = methods;
    const section = watch(`sections.${sectionIndex}`);
    
    const { fields } = useFieldArray({
        control,
        name: `sections.${sectionIndex}.content`,
    });

    const contentIsArray = Array.isArray(section.content);
    
    const renderContentField = (basePath: string) => {
        return (
            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label>Image</Label>
                    <Controller
                        name={`${basePath}.image`}
                        control={control}
                        render={({ field }) => <ImageField value={field.value} onChange={field.onChange} />}
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Link URL</Label>
                    <Input {...register(`${basePath}.link`)} />
                </div>
            </div>
        )
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Edit Section</DialogTitle>
                <DialogDescription>
                    Modify the details for the "{section.name}" section.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                    <Label htmlFor="section-name">Section Name</Label>
                    <Input id="section-name" {...register(`sections.${sectionIndex}.name`)} />
                </div>
                
                {section.type === 'product-grid' && (
                    <Alert>
                        <AlertTitle>Automatic Content</AlertTitle>
                        <AlertDescription>
                            The products in this section are determined by the "Section Name". For example, "New Arrivals" or "Popular Products".
                        </AlertDescription>
                    </Alert>
                )}

                {section.type === 'featured-categories' && contentIsArray && (
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Categories</Label>
                        {fields.map((field, index) => (
                            <Card key={field.id} className="p-3 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input {...register(`sections.${sectionIndex}.content.${index}.name`)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Image</Label>
                                     <Controller
                                        name={`sections.${sectionIndex}.content.${index}.image`}
                                        control={control}
                                        render={({ field: imageField }) => <ImageField value={imageField.value} onChange={imageField.onChange} previewSize={{width: 100, height: 100}} />}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
                
                {section.type.includes('banner') && (
                     <div className="space-y-3">
                        <Label className="text-base font-medium">Banners</Label>
                        {(contentIsArray ? fields : [section.content]).map((field: any, index: number) => (
                             <Card key={field.id || index} className="p-3">
                                <p className="text-sm font-semibold mb-2">Banner {index + 1}</p>
                                {renderContentField(contentIsArray ? `sections.${sectionIndex}.content.${index}` : `sections.${sectionIndex}.content`)}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button onClick={onClose}>Done</Button>
            </DialogFooter>
        </>
    )
}


function HeroBannerForm({ onSave, methods }: { onSave: () => void; methods: UseFormReturn<HomepageFormData>; }) {
    const { control, register } = methods;
    const bannerIndex = 0;
    const bannerPath = `heroBanners.${bannerIndex}`;

    return (
        <div>
            <DialogHeader>
                <DialogTitle>Edit Hero Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <Controller
                        name={`${bannerPath}.image`}
                        control={control}
                        render={({ field }) => <ImageField value={field.value} onChange={field.onChange} />}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input id="headline" {...register(`${bannerPath}.headline`)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="subheadline">Subheadline</Label>
                    <Textarea id="subheadline" {...register(`${bannerPath}.subheadline`)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input id="buttonText" {...register(`${bannerPath}.buttonText`)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="link">Button Link</Label>
                        <Input id="link" {...register(`${bannerPath}.link`)} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={onSave}>Done</Button>
            </DialogFooter>
        </div>
    );
}

function FooterForm({ onSave, methods }: { onSave: () => void; methods: UseFormReturn<HomepageFormData>; }) {
    const { register, control } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'footer.companyLinks'
    });

    return (
        <>
        <DialogHeader>
            <DialogTitle>Edit Footer</DialogTitle>
            <DialogDescription>Modify the content displayed in your website's footer.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-6">
            <div className="space-y-6">
                <Card className="p-4">
                    <h3 className="text-lg font-medium mb-2">General</h3>
                    <div className="space-y-2">
                        <Label htmlFor="footer-desc">Description</Label>
                        <Textarea id="footer-desc" {...register('footer.description')} />
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                    <div className="space-y-2">
                        <Label htmlFor="footer-address">Address</Label>
                        <Input id="footer-address" {...register('footer.contact.address')} />
                        <Label htmlFor="footer-phone">Phone</Label>
                        <Input id="footer-phone" {...register('footer.contact.phone')} />
                        <Label htmlFor="footer-email">Email</Label>
                        <Input id="footer-email" type="email" {...register('footer.contact.email')} />
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="text-lg font-medium mb-2">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="footer-facebook">Facebook URL</Label>
                            <Input id="footer-facebook" {...register('footer.socialLinks.facebook')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footer-twitter">Twitter URL</Label>
                            <Input id="footer-twitter" {...register('footer.socialLinks.twitter')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footer-instagram">Instagram URL</Label>
                            <Input id="footer-instagram" {...register('footer.socialLinks.instagram')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footer-linkedin">LinkedIn URL</Label>
                            <Input id="footer-linkedin" {...register('footer.socialLinks.linkedin')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footer-youtube">YouTube URL</Label>
                            <Input id="footer-youtube" {...register('footer.socialLinks.youtube')} />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                     <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">Company Links</h3>
                        <Button type="button" size="sm" variant="outline" onClick={() => append({ label: '', href: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-end">
                                <div className="grid grid-cols-2 gap-2 flex-grow">
                                    <div className="space-y-1">
                                        <Label>Label</Label>
                                        <Input {...register(`footer.companyLinks.${index}.label`)} placeholder="e.g. Privacy Policy" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>URL</Label>
                                        <Input {...register(`footer.companyLinks.${index}.href`)} placeholder="/privacy" />
                                    </div>
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </ScrollArea>
        <DialogFooter className="pt-4">
            <Button onClick={onSave}>Done</Button>
        </DialogFooter>
        </>
    );
}

    