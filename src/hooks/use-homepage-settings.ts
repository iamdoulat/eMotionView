
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { defaultHomepageSections } from '@/lib/placeholder-data';

const SETTINGS_DOC_PATH = 'public_content/homepage';

export interface FeaturedCategory {
  id: string;
  name: string;
  image: string;
}

export function useHomepageSettings() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<FeaturedCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const docRef = doc(db, SETTINGS_DOC_PATH);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const featuredCategoriesSection = data.sections?.find((s: any) => s.type === 'featured-categories');
                setCategories(featuredCategoriesSection?.content || []);
            } else {
                 const defaultFeaturedCategories = defaultHomepageSections.find(s => s.type === 'featured-categories');
                 setCategories(defaultFeaturedCategories?.content || []);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load categories.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const saveChanges = async (allCategories: FeaturedCategory[]) => {
        setIsSubmitting(true);
        try {
            const docRef = doc(db, SETTINGS_DOC_PATH);
            const docSnap = await getDoc(docRef);
            const existingData = docSnap.exists() ? docSnap.data() : { sections: defaultHomepageSections };
            
            const updatedSections = existingData.sections.map((section: any) => {
                if (section.type === 'featured-categories') {
                    return { ...section, content: allCategories };
                }
                return section;
            });
            
            await setDoc(docRef, { sections: updatedSections }, { merge: true });
            setCategories(allCategories);
            toast({ title: 'Success', description: 'Homepage settings updated successfully.' });
        } catch (error) {
            console.error("Error updating document:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not update homepage settings.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const addCategory = async (name: string, imageFile?: File) => {
        if (!imageFile) {
            toast({ variant: 'destructive', title: 'Error', description: 'An image is required.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const storageRef = ref(storage, `homepage/categories/${Date.now()}-${imageFile.name}`);
            const uploadResult = await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(uploadResult.ref);

            const newCategory: FeaturedCategory = {
                id: `cat-${Date.now()}`,
                name,
                image: imageUrl
            };

            await saveChanges([...categories, newCategory]);
        } catch (error) {
            console.error("Error adding category:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not add the category.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateCategory = async (existingCategory: FeaturedCategory, newName: string, newImageFile?: File) => {
        setIsSubmitting(true);
        let imageUrl = existingCategory.image;
        try {
            if (newImageFile) {
                const storageRef = ref(storage, `homepage/categories/${Date.now()}-${newImageFile.name}`);
                const uploadResult = await uploadBytes(storageRef, newImageFile);
                imageUrl = await getDownloadURL(uploadResult.ref);
            }

            const updatedCategory: FeaturedCategory = {
                ...existingCategory,
                name: newName,
                image: imageUrl,
            };

            const updatedCategories = categories.map(c => c.id === existingCategory.id ? updatedCategory : c);
            await saveChanges(updatedCategories);

        } catch (error) {
            console.error("Error updating category:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the category.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const deleteCategory = async (categoryId: string) => {
        const updatedCategories = categories.filter(c => c.id !== categoryId);
        await saveChanges(updatedCategories);
    };

    return {
        categories,
        isLoading,
        isSubmitting,
        addCategory,
        updateCategory,
        deleteCategory,
    };
}
