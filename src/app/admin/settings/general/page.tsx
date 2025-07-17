
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const SETTINGS_DOC_PATH = 'settings/general';

const generalSettingsSchema = z.object({
  logo: z.union([z.instanceof(FileList).optional(), z.string().optional()]),
  companyName: z.string().min(1, 'Company name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('A valid email is required'),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

const defaultSettings = {
    logo: 'https://placehold.co/150x50.png',
    companyName: 'eMotionView',
    address: '10/25 Eastern Plaza, Hatirpool, Dhaka-1205',
    phone: '09677460460',
    email: 'motionview22@gmail.com.bd'
};

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const [currentLogo, setCurrentLogo] = useState<string>(defaultSettings.logo);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: defaultSettings,
  });

  const { reset, handleSubmit, register, watch, formState: { isSubmitting } } = form;

  const logoPreview = watch('logo');

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, SETTINGS_DOC_PATH);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const settings = docSnap.data();
          reset(settings);
          setCurrentLogo(settings.logo || defaultSettings.logo);
        } else {
          reset(defaultSettings);
        }
      } catch (error) {
        console.error("Failed to fetch general settings:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load settings.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [reset, toast]);

  const onSubmit: SubmitHandler<GeneralSettingsFormData> = async (data) => {
    try {
      let finalLogoUrl = currentLogo;
      
      if (data.logo instanceof FileList && data.logo.length > 0) {
        const file = data.logo[0];
        const storageRef = ref(storage, `general/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        finalLogoUrl = await getDownloadURL(storageRef);
      }

      const finalData = { ...data, logo: finalLogoUrl };

      const docRef = doc(db, SETTINGS_DOC_PATH);
      await setDoc(docRef, finalData, { merge: true });

      setCurrentLogo(finalLogoUrl);
      reset(finalData); // Reset form with the new data including the new logo URL

      toast({ title: 'Success', description: 'General settings have been updated.' });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
    }
  };
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter><Skeleton className="h-10 w-28" /></CardFooter>
        </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage your store's main identity and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                <FormItem>
                    <Label>Company Name</Label>
                    <FormControl>
                        <Input placeholder="Your Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                <FormItem>
                    <Label>Company Logo</Label>
                    <FormControl>
                        <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                    </FormControl>
                    {currentLogo && typeof logoPreview !== 'object' && (
                        <div className="mt-2 p-2 border rounded-md inline-block bg-muted">
                            <Image src={currentLogo} alt="Current Logo" width={150} height={50} className="object-contain" />
                        </div>
                    )}
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                <FormItem>
                    <Label>Address</Label>
                    <FormControl>
                        <Textarea placeholder="Your company address" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <Label>Contact Phone</Label>
                        <FormControl>
                            <Input placeholder="Your contact phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <Label>Contact Email</Label>
                        <FormControl>
                            <Input type="email" placeholder="your-contact@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
          </CardContent>
          <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
              </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
