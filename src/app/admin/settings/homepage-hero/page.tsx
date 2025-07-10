
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import NextImage from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { defaultHeroBanners, type HeroBanner } from '@/lib/placeholder-data';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const heroSchema = z.object({
  headline: z.string().min(1, 'Headline is required'),
  subheadline: z.string().min(1, 'Subheadline is required'),
  buttonText: z.string().min(1, 'Button text is required'),
  link: z.string().min(1, 'Link is required'),
  image: z.union([z.instanceof(FileList).optional(), z.string().optional()]),
});

type HeroFormData = z.infer<typeof heroSchema>;

const SETTINGS_DOC_PATH = 'public_content/homepage';

export default function HomepageHeroSettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentImage, setCurrentImage] = useState<string>('');

    const form = useForm<HeroFormData>({
        resolver: zodResolver(heroSchema)
    });

    const fetchHeroData = useCallback(async () => {
        setIsLoading(true);
        try {
            const docRef = doc(db, SETTINGS_DOC_PATH);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const heroBanner = data.heroBanners?.find((b: any) => b.headline) || defaultHeroBanners[0];
                form.reset({
                    headline: heroBanner.headline,
                    subheadline: heroBanner.subheadline,
                    buttonText: heroBanner.buttonText,
                    link: heroBanner.link,
                });
                setCurrentImage(heroBanner.image);
            } else {
                 form.reset(defaultHeroBanners[0]);
                 setCurrentImage(defaultHeroBanners[0].image);
            }
        } catch (error) {
            console.error("Failed to fetch hero data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load hero data.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, form]);

    useEffect(() => {
        fetchHeroData();
    }, [fetchHeroData]);

    const onSubmit: SubmitHandler<HeroFormData> = async (data) => {
        setIsSubmitting(true);
        let imageUrl = currentImage;
        
        try {
            if (data.image instanceof FileList && data.image.length > 0) {
                const file = data.image[0];
                const storageRef = ref(storage, `homepage/hero/${Date.now()}-${file.name}`);
                const uploadResult = await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(uploadResult.ref);
                setCurrentImage(imageUrl);
            }
            
            const newHeroData: HeroBanner = {
                id: 1, // Since we are only managing one main hero banner for now
                headline: data.headline,
                subheadline: data.subheadline,
                buttonText: data.buttonText,
                link: data.link,
                image: imageUrl,
            };

            const docRef = doc(db, SETTINGS_DOC_PATH);
            // Replace the main hero banner (or create it) in the array of hero banners
            await setDoc(docRef, { heroBanners: [newHeroData] }, { merge: true });

            toast({ title: 'Success', description: 'Homepage hero banner updated successfully.' });

        } catch (error: any) {
            console.error("Error saving hero banner:", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not save the hero banner.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </CardContent>
                 <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Homepage Hero Section</CardTitle>
                <CardDescription>Customize the main banner on your homepage.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                         <FormField
                            control={form.control}
                            name="headline"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Headline</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. GADGET FEST" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="subheadline"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Subheadline</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Up to 60% off..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="buttonText"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Button Text</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Shop Now" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="link"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Button Link</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. /products" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Background Image</FormLabel>
                                 <FormControl>
                                    <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {currentImage && (
                            <div>
                                <Label>Current Image Preview</Label>
                                <div className="mt-2 w-full aspect-video max-w-lg relative rounded-md border overflow-hidden">
                                <NextImage src={currentImage} alt="Hero preview" fill className="object-cover" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
