
"use client";

import { useState, useEffect } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Section, SectionType, HeroBanner } from "@/lib/placeholder-data";
import { defaultHeroBanners, defaultHomepageSections } from "@/lib/placeholder-data";
import { HomepageSectionItem } from "@/components/admin/homepage-section-item";
import { HeroBannerItem } from "@/components/admin/hero-banner-item";
import { useAuth } from "@/hooks/use-auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { saveHomepageSettings } from '@/lib/actions/homepage';


export default function HomepageSettingsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<Record<string, File>>({});

  const { toast } = useToast();
  const { user, role, isLoading: isAuthLoading } = useAuth();

  const hasPermission = role === 'Admin' || role === 'Manager';

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const fetchSettings = async () => {
      if (!user || !hasPermission) {
          setIsLoading(false);
          setHeroBanners(defaultHeroBanners);
          setSections(defaultHomepageSections);
          return;
      };

      try {
        const docRef = doc(db, "public_content", "homepage");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHeroBanners(data.heroBanners || defaultHeroBanners);
          setSections(data.sections || defaultHomepageSections);
        } else {
          setHeroBanners(defaultHeroBanners);
          setSections(defaultHomepageSections);
        }
      } catch (error) {
        console.error("Failed to fetch homepage settings:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not load homepage settings." });
        setHeroBanners(defaultHeroBanners);
        setSections(defaultHomepageSections);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast, user, role, isAuthLoading, hasPermission]);

  const handleFileChange = (itemId: string, file: File) => {
    setFilesToUpload(prev => ({ ...prev, [itemId]: file }));
  };
  
  const handleHeroBannerChange = (id: number, field: keyof HeroBanner, value: string) => {
    setHeroBanners(prev => prev.map(banner => {
        if (banner.id === id) {
            return { ...banner, [field]: value };
        }
        return banner;
    }));
  };
  
  const handleAddHeroBanner = () => {
    setHeroBanners(prev => [
        ...prev,
        {
            id: Date.now(),
            image: `https://placehold.co/900x440.png`,
            headline: "New Banner Headline",
            subheadline: "Describe the promotion here.",
            buttonText: "Shop Now",
            link: "/products",
        }
    ]);
  };

  const handleDeleteHeroBanner = (id: number) => {
    setHeroBanners(prev => prev.filter(banner => banner.id !== id));
  };

  const handleSectionUpdate = (updatedSection: Section) => {
    setSections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s));
  };
  
  const handleDeleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const handleAddNewSection = (type: SectionType) => {
    let newSection: Section;
    const id = `section-${Date.now()}`;
    switch (type) {
        case 'promo-banner-pair':
            newSection = {
                id,
                name: "New Promotional Banners",
                type: 'promo-banner-pair',
                content: [
                    { id: `promo1-${id}`, image: 'https://placehold.co/800x400.png', link: '#' },
                    { id: `promo2-${id}`, image: 'https://placehold.co/800x400.png', link: '#' },
                ]
            };
            break;
        case 'promo-banner-trio':
             newSection = {
                id,
                name: "New Triple Banners",
                type: 'promo-banner-trio',
                content: [
                    { id: `promo1-${id}`, image: 'https://placehold.co/400x200.png', link: '#' },
                    { id: `promo2-${id}`, image: 'https://placehold.co/400x200.png', link: '#' },
                    { id: `promo3-${id}`, image: 'https://placehold.co/400x200.png', link: '#' },
                ]
            };
            break;
        case 'single-banner-large':
            newSection = {
                id,
                name: "New Large Banner",
                type: 'single-banner-large',
                content: { image: 'https://placehold.co/1200x250.png', link: '#' }
            };
            break;
        case 'featured-categories':
             newSection = {
                id,
                name: "New Featured Categories",
                type: 'featured-categories',
                content: []
            };
            break;
        case 'one-column-banner':
            newSection = {
                id,
                name: "New 1-Column Banner",
                type: 'one-column-banner',
                content: [{ id: `promo-${id}`, image: 'https://placehold.co/1200x400.png', link: '#' }]
            };
            break;
        case 'two-column-banner':
            newSection = {
                id,
                name: "New 2-Column Banners",
                type: 'two-column-banner',
                content: [
                    { id: `promo1-${id}`, image: 'https://placehold.co/600x400.png', link: '#' },
                    { id: `promo2-${id}`, image: 'https://placehold.co/600x400.png', link: '#' },
                ]
            };
            break;
        case 'three-column-banner':
            newSection = {
                id,
                name: "New 3-Column Banners",
                type: 'three-column-banner',
                content: [
                    { id: `promo1-${id}`, image: 'https://placehold.co/400x400.png', link: '#' },
                    { id: `promo2-${id}`, image: 'https://placehold.co/400x400.png', link: '#' },
                    { id: `promo3-${id}`, image: 'https://placehold.co/400x400.png', link: '#' },
                ]
            };
            break;
        case 'product-grid':
        default:
            newSection = {
                id,
                name: "New Content Section",
                type: 'product-grid',
                content: null
            };
            break;
    }
    setSections(prev => [...prev, newSection]);
  };
  
  const handleSave = async () => {
    if (!user || !hasPermission) {
        toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "You do not have the required permissions to save these settings.",
        });
        return;
    }

    setIsSaving(true);
    let finalHeroBanners = JSON.parse(JSON.stringify(heroBanners));
    let finalSections = JSON.parse(JSON.stringify(sections));

    // --- Start: Image Upload Logic ---
    try {
        const uploadPromises = Object.entries(filesToUpload).map(async ([itemId, file]) => {
            const safeFileName = encodeURIComponent(file.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, ''));
            const storageRef = ref(storage, `homepage/${Date.now()}-${safeFileName}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            return { itemId, downloadURL };
        });

        const uploadResults = await Promise.all(uploadPromises);

        const urlMap = new Map<string, string>();
        uploadResults.forEach(result => urlMap.set(result.itemId, result.downloadURL));

        finalHeroBanners = finalHeroBanners.map((banner: HeroBanner) => {
            const newUrl = urlMap.get(String(banner.id));
            return newUrl ? { ...banner, image: newUrl } : banner;
        });

        finalSections = finalSections.map((section: Section) => {
            if (Array.isArray(section.content)) {
                const newContent = section.content.map((item: any) => {
                    const newUrl = urlMap.get(item.id);
                    return newUrl ? { ...item, image: newUrl } : item;
                });
                return { ...section, content: newContent };
            } else if (section.content?.image) {
                const newUrl = urlMap.get(section.id);
                if (newUrl) {
                    return { ...section, content: { ...section.content, image: newUrl } };
                }
            }
            return section;
        });
    } catch (error: any) {
        console.error("Error during image upload to Firebase Storage:", error);
        toast({
            variant: "destructive",
            title: "Image Upload Failed",
            description: `Could not upload images. Please check your Storage rules. Error: ${error.code || 'Unknown'}`,
        });
        setIsSaving(false);
        return;
    }
    // --- End: Image Upload Logic ---

    // --- Start: Firestore Save Logic (using Server Action) ---
    try {
      const result = await saveHomepageSettings({ heroBanners: finalHeroBanners, sections: finalSections });
      if (result && result.error) {
        const err = new Error(result.error.message || 'An unknown error occurred on the server.');
        (err as any).code = result.error.code || 'permission-denied';
        throw err;
      }
      
      setHeroBanners(finalHeroBanners);
      setSections(finalSections);
      setFilesToUpload({});

      toast({
        title: "Success",
        description: "Homepage settings have been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error saving settings to Firestore:", error);
      toast({
        variant: "destructive",
        title: "Database Save Failed",
        description: `Could not save layout. Error: ${error.code || 'permission-denied'}`,
      });
    } finally {
        setIsSaving(false);
    }
    // --- End: Firestore Save Logic ---
  };

  
  if (isLoading || isAuthLoading) {
      return (
          <div className="space-y-8">
              <h1 className="text-3xl font-bold tracking-tight">Homepage Design</h1>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
               <div className="flex justify-end">
                  <Skeleton className="h-12 w-36" />
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Homepage Design</h1>
      
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Hero Banners</CardTitle>
                    <CardDescription>Manage the rotating banners at the top of your homepage.</CardDescription>
                </div>
                <Button onClick={handleAddHeroBanner} disabled={!hasPermission}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Banner
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" className="w-full space-y-2">
                {heroBanners.map((banner) => (
                    <HeroBannerItem
                        key={banner.id}
                        banner={banner}
                        onChange={handleHeroBannerChange}
                        onDelete={() => handleDeleteHeroBanner(banner.id)}
                        onFileChange={(id, file) => handleFileChange(String(id), file)}
                    />
                ))}
            </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Sections</CardTitle>
          <CardDescription>Add, edit, or delete sections on your homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections.map((section) => (
              <HomepageSectionItem 
                key={section.id} 
                section={section}
                user={user}
                onSave={handleSectionUpdate}
                onDelete={() => handleDeleteSection(section.id)}
                onFileChange={handleFileChange}
              />
            ))}
          </div>
          <div className="mt-4 border-t pt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleAddNewSection('product-grid')} disabled={!hasPermission}>
              <Plus className="mr-2 h-4 w-4" />
              Add Content Section
            </Button>
             <Button variant="outline" onClick={() => handleAddNewSection('promo-banner-trio')} disabled={!hasPermission}>
              <Plus className="mr-2 h-4 w-4" />
              Add Triple Banners
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('promo-banner-pair')} disabled={!hasPermission}>
              <Plus className="mr-2 h-4 w-4" />
              Add Paired Banners
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('single-banner-large')} disabled={!hasPermission}>
              <Plus className="mr-2 h-4 w-4" />
              Add Large Banner
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('one-column-banner')} disabled={!hasPermission}>
              <Plus className="mr-2 h-4 w-4" />
              Add 1-Column Banner
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('two-column-banner')} disabled={!hasPermission}>
              <Plus className="mr-2 h-4 w-4" />
              Add 2-Column Banners
            </Button>
            <Button variant="outline" onClick={() => handleAddNewSection('three-column-banner')} disabled={!hasPermission}>
              <Plus className="mr-2 h-4 w-4" />
              Add 3-Column Banners
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
          <Button size="lg" onClick={handleSave} disabled={isSaving || !hasPermission}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
      </div>
    </div>
  );
}
