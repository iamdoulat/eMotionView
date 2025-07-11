
"use client";

import { useEffect } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
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
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { defaultFooterSettings, type FooterSettings } from '@/lib/placeholder-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const linkSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  href: z.string().min(1, 'Link is required'),
});

const footerSettingsSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  socialLinks: z.object({
    facebook: z.string().url().or(z.literal('')),
    twitter: z.string().url().or(z.literal('')),
    instagram: z.string().url().or(z.literal('')),
    linkedin: z.string().url().or(z.literal('')),
    youtube: z.string().url().or(z.literal('')),
  }),
  companyLinks: z.array(linkSchema),
  contact: z.object({
    address: z.string().min(1, 'Address is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Valid email is required'),
  }),
});

type FooterSettingsFormData = z.infer<typeof footerSettingsSchema>;

const SETTINGS_DOC_PATH = 'public_content/homepage';

export default function FooterSettingsPage() {
  const { toast } = useToast();
  const form = useForm<FooterSettingsFormData>({
    resolver: zodResolver(footerSettingsSchema),
    defaultValues: defaultFooterSettings,
  });
  
  const { register, control, handleSubmit, reset, formState: { isSubmitting, isLoading } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "companyLinks",
  });

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const docRef = doc(db, SETTINGS_DOC_PATH);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data()?.footer) {
          reset(docSnap.data().footer);
        } else {
          reset(defaultFooterSettings);
        }
      } catch (error) {
        console.error("Failed to fetch footer settings:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load footer settings.' });
      }
    };
    fetchFooterSettings();
  }, [reset, toast]);
  
  const onSubmit: SubmitHandler<FooterSettingsFormData> = async (data) => {
    try {
      const docRef = doc(db, SETTINGS_DOC_PATH);
      await setDoc(docRef, { footer: data }, { merge: true });
      toast({ title: 'Success', description: 'Footer settings have been updated.' });
    } catch (error) {
      console.error("Error saving footer settings:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save footer settings.' });
    }
  };
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter><Skeleton className="h-10 w-28" /></CardFooter>
        </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Footer Settings</CardTitle>
          <CardDescription>Manage the content displayed in your website's footer.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={['description', 'contact']} className="w-full space-y-4">
                <AccordionItem value="description" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-lg font-semibold">General</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Footer Description</Label>
                            <Textarea id="description" {...register('description')} rows={4} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="contact" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-lg font-semibold">Contact Information</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="contact.address">Address</Label>
                            <Input id="contact.address" {...register('contact.address')} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact.phone">Phone</Label>
                                <Input id="contact.phone" {...register('contact.phone')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact.email">Email</Label>
                                <Input id="contact.email" {...register('contact.email')} />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="company-links" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-lg font-semibold">Company Links</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                        {fields.map((field, index) => (
                             <div key={field.id} className="flex items-end gap-4 p-4 bg-secondary/50 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                    <div className="space-y-2">
                                        <Label>Label</Label>
                                        <Input {...register(`companyLinks.${index}.label`)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Link/Href</Label>
                                        <Input {...register(`companyLinks.${index}.href`)} />
                                    </div>
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => append({ label: '', href: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                        </Button>
                    </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="social-links" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-lg font-semibold">Social Media Links</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="socialLinks.facebook">Facebook</Label>
                            <Input id="socialLinks.facebook" {...register('socialLinks.facebook')} placeholder="https://facebook.com/your-page"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="socialLinks.twitter">Twitter</Label>
                            <Input id="socialLinks.twitter" {...register('socialLinks.twitter')} placeholder="https://twitter.com/your-handle"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="socialLinks.instagram">Instagram</Label>
                            <Input id="socialLinks.instagram" {...register('socialLinks.instagram')} placeholder="https://instagram.com/your-handle"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="socialLinks.linkedin">LinkedIn</Label>
                            <Input id="socialLinks.linkedin" {...register('socialLinks.linkedin')} placeholder="https://linkedin.com/in/your-profile"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="socialLinks.youtube">YouTube</Label>
                            <Input id="socialLinks.youtube" {...register('socialLinks.youtube')} placeholder="https://youtube.com/your-channel"/>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
        <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
