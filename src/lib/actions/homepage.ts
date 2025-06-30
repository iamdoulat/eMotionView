
'use server';

import { db } from '@/lib/firebase';
import type { HeroBanner, Section } from '@/lib/placeholder-data';
import { doc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface HomepageSettings {
  heroBanners: HeroBanner[];
  sections: Section[];
}

export async function saveHomepageSettings(settings: HomepageSettings) {
  try {
    const settingsRef = doc(db, 'public_content', 'homepage');
    await setDoc(settingsRef, settings);

    revalidatePath('/');
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error saving homepage settings via server action:', error);
    return { success: false, error: { message: error.message, code: error.code } };
  }
}
