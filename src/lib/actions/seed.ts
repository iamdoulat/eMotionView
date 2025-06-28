
'use server';

import { db } from '@/lib/firebase';
import { 
    products, 
    staffUsers,
    customerUsers,
    categories, 
    brands, 
    attributes, 
    suppliers 
} from '@/lib/placeholder-data';
import { collection, writeBatch, getDocs, query, limit, doc } from 'firebase/firestore';

async function isCollectionEmpty(collectionName: string): Promise<boolean> {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, limit(1));
    const snapshot = await getDocs(q);
    return snapshot.empty;
}

export async function seedDatabase() {
    try {
        const batch = writeBatch(db);
        let seededCount = 0;
        let messageLog = [];

        // Seed Staff Users into 'users' collection
        if (await isCollectionEmpty('users')) {
            staffUsers.forEach((user) => {
                const docRef = doc(db, 'users', user.uid);
                batch.set(docRef, user);
            });
            seededCount += staffUsers.length;
            messageLog.push(`${staffUsers.length} staff users`);
        } else {
            console.log(`Collection 'users' is not empty. Skipping seeding.`);
        }

        // Seed Customer Users into 'customers' collection
        if (await isCollectionEmpty('customers')) {
            customerUsers.forEach((user) => {
                const docRef = doc(db, 'customers', user.uid);
                batch.set(docRef, user);
            });
            seededCount += customerUsers.length;
            messageLog.push(`${customerUsers.length} customers`);
        } else {
            console.log(`Collection 'customers' is not empty. Skipping seeding.`);
        }

        // Seed other collections
        const collectionsToSeed = [
            { name: 'products', data: products },
            { name: 'categories', data: categories },
            { name: 'brands', data: brands },
            { name: 'attributes', data: attributes },
            { name: 'suppliers', data: suppliers },
        ];

        for (const { name, data } of collectionsToSeed) {
            if (await isCollectionEmpty(name)) {
                data.forEach((item) => {
                    const docRef = doc(collection(db, name));
                    batch.set(docRef, item);
                });
                seededCount += data.length;
                messageLog.push(`${data.length} ${name}`);
            } else {
                console.log(`Collection '${name}' is not empty. Skipping seeding.`);
            }
        }

        if (seededCount > 0) {
            await batch.commit();
            const message = `Successfully seeded: ${messageLog.join(', ')}. Refresh to see the data.`;
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
