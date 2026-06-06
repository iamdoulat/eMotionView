"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadFile, getFileUrl } from '@/lib/r2';
import { defaultHomepageSections } from '@/lib/placeholder-data';

function doc(_db: any, collection: string, docId: string) {
  return { _collection: collection, _id: docId };
}

export interface FeaturedCategory {
  id: string;
  name: string;
  image: string;
}

const API_PATH = '/api/data/public_content%2Fhomepage';

export function useHomepageSettings() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<FeaturedCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_PATH}?id=main`);
            if (res.ok) {
                const data = await res.json();
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

    const getExistingData = async () => {
        try {
            const res = await fetch(`${API_PATH}?id=main`);
            if (res.ok) {
                return await res.json();
            }
        } catch {}
        return { sections: defaultHomepageSections };
    };

    const saveChanges = async (allCategories: FeaturedCategory[]) => {
        setIsSubmitting(true);
        try {
            const existingData = await getExistingData();
            const updatedSections = existingData.sections.map((section: any) => {
                if (section.type === 'featured-categories') {
                    return { ...section, content: allCategories };
                }
                return section;
            });

            await fetch(`${API_PATH}/main`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sections: updatedSections }),
            });
            setCategories(allCategories);
            toast({ title: 'Success', description: 'Homepage settings updated successfully.' });
        } catch (error) {
            console.error("Error updating document:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not update homepage settings.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const uploadImage = async (file: File, prefix: string): Promise<string> => {
        const key = `${prefix}/${Date.now()}-${file.name}`;
        return uploadFile(key, file, file.type);
    };

    const addCategory = async (name: string, imageFile?: File) => {
        if (!imageFile) {
            toast({ variant: 'destructive', title: 'Error', description: 'An image is required.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const imageUrl = await uploadImage(imageFile, 'homepage/categories');

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
                imageUrl = await uploadImage(newImageFile, 'homepage/categories');
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
