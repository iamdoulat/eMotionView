
'use server';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase-admin/storage';
import { initializeAdminApp } from '@/lib/firebase-admin';

// Initialize Firebase Admin SDK
const adminApp = initializeAdminApp();
const bucket = getStorage(adminApp).bucket();

export async function uploadFile(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;

    if (!file) {
      return { error: 'No file provided for upload.' };
    }
    if (!path) {
      return { error: 'No upload path specified.' };
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${path}/${Date.now()}-${file.name}`;
    
    const fileRef = bucket.file(fileName);

    await fileRef.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const downloadURL = await getDownloadURL(fileRef);

    return { url: downloadURL };
  } catch (error: any) {
    console.error('Error in uploadFile server action:', error);
    return { error: error.message || 'An unknown error occurred during file upload.' };
  }
}
