
"use client";

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const pageSchema = z.object({
  title: z.string(),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
});

type PageFormData = z.infer<typeof pageSchema>;

const staticPages: Record<string, { title: string }> = {
    'privacy-policy': { title: 'Privacy Policy' },
    'terms-and-conditions': { title: 'Terms and conditions' },
    'return-and-refund-policy': { title: 'Return and Refund Policy' },
    'emi': { title: 'EMI' },
    'warranty': { title: 'Warranty' },
    'delivery-policy': { title: 'Delivery Policy' },
    'support-center': { title: 'Support Center' },
    'contact-us': { title: 'Contact Us' },
};

export default function EditPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const pageDetails = staticPages[slug];

    const form = useForm<PageFormData>({
        resolver: zodResolver(pageSchema),
        defaultValues: { title: pageDetails?.title || '', content: '' },
    });
    
    const { handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = form;

    useEffect(() => {
        const fetchPageContent = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'pages', slug);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    reset({ title: data.title, content: data.content });
                } else {
                    reset({ title: pageDetails.title, content: `<p>Start writing content for ${pageDetails.title} here.</p>` });
                }
            } catch (error) {
                console.error("Failed to fetch page content:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load page content.' });
            } finally {
                setIsLoading(false);
            }
        };

        if (pageDetails) {
            fetchPageContent();
        }
    }, [slug, reset, toast, pageDetails]);
    
    const onSubmit: SubmitHandler<PageFormData> = async (data) => {
        try {
            const docRef = doc(db, 'pages', slug);
            await setDoc(docRef, data, { merge: true });
            toast({ title: 'Success', description: `"${data.title}" page has been updated.` });
        } catch (error) {
            console.error("Error saving page content:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the page.' });
        }
    };

    if (!pageDetails) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Page Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The page you are trying to edit does not exist.</p>
                </CardContent>
                 <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="/admin/settings/pages">Back to Pages List</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }
    
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-2/5" />
                    <Skeleton className="h-4 w-3/5 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>{`Edit: ${pageDetails.title}`}</CardTitle>
                    <CardDescription>Use the rich text editor below to update the page content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RichTextEditor
                        content={form.getValues('content')}
                        onChange={(newContent) => setValue('content', newContent, { shouldValidate: true, shouldDirty: true })}
                    />
                    {errors.content && <p className="text-destructive text-sm mt-2">{errors.content.message}</p>}
                </CardContent>
                <CardFooter className="gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/settings/pages">Cancel</Link>
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

