
'use server';

import { db } from '@/lib/firebase';
import { 
    products, 
    users, 
    categories, 
    brands, 
    attributes, 
    suppliers 
} from '@/lib/placeholder-data';
import { collection, writeBatch, getDocs, query, limit } from 'firebase/firestore';

async function isCollectionEmpty(collectionName: string): Promise<boolean> {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, limit(1));
    const snapshot = await getDocs(q);
    return snapshot.empty;
}

export async function seedDatabase() {
    try {
        const collectionsToSeed = [
            { name: 'products', data: products },
            { name: 'users', data: users },
            { name: 'categories', data: categories },
            { name: 'brands', data: brands },
            { name: 'attributes', data: attributes },
            { name: 'suppliers', data: suppliers },
        ];

        const batch = writeBatch(db);
        let seededCount = 0;

        for (const { name, data } of collectionsToSeed) {
            if (await isCollectionEmpty(name)) {
                data.forEach((item) => {
                    const docRef = collection(db, name);
                    batch.set(docRef.doc(), item);
                });
                seededCount += data.length;
                console.log(`Collection '${name}' will be seeded.`);
            } else {
                console.log(`Collection '${name}' is not empty. Skipping seeding.`);
            }
        }

        if (seededCount > 0) {
            await batch.commit();
            const message = `Successfully seeded ${seededCount} documents. Refresh to see the data.`;
            console.log(message);
            return { message };
        } else {
            const message = "All collections already contain data. Nothing to seed.";
            console.log(message);
            return { message };
        }
    } catch (e: any) {
        console.error('Error seeding database:', e);
        return { error: e.message || 'An unknown error occurred.' };
    }
}
