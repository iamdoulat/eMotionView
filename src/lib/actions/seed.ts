'use server';

import { collection, getDocs, query, limit, doc, db } from '@/lib/db';
import { findMany, deleteOne, insertOne } from '@/lib/mongodb';
import { 
    products, 
    staffUsers,
    customerUsers,
    categories, 
    brands, 
    attributes, 
    suppliers 
} from '@/lib/placeholder-data';

async function isCollectionEmpty(collectionName: string): Promise<boolean> {
    const q = query(collection(collectionName), limit(1));
    const snapshot = await getDocs(q);
    return snapshot.empty;
}

export async function seedDatabase() {
    try {
        let seededCount = 0;
        let messageLog = [];

        if (await isCollectionEmpty('users')) {
            for (const user of staffUsers) {
                const docRef = doc(db, 'users', user.uid);
                const { id, ...data } = docRef as any;
                await insertOne('users', user);
            }
            seededCount += staffUsers.length;
            messageLog.push(`${staffUsers.length} staff users`);
        }

        if (await isCollectionEmpty('customers')) {
            for (const user of customerUsers) {
                await insertOne('customers', user);
            }
            seededCount += customerUsers.length;
            messageLog.push(`${customerUsers.length} customers`);
        }

        const collectionsToSeed = [
            { name: 'products', data: products },
            { name: 'categories', data: categories },
            { name: 'brands', data: brands },
            { name: 'attributes', data: attributes },
            { name: 'suppliers', data: suppliers },
        ];

        for (const { name, data } of collectionsToSeed) {
            if (await isCollectionEmpty(name)) {
                for (const item of data) {
                    const dataToInsert = { ...(item as any) };
                    delete dataToInsert.id;
                    await insertOne(name, dataToInsert);
                }
                seededCount += data.length;
                messageLog.push(`${data.length} ${name}`);
            }
        }

        if (seededCount > 0) {
            const message = `Successfully seeded: ${messageLog.join(', ')}.`;
            return { message };
        } else {
            const message = "All collections already contain data. Nothing to seed.";
            return { message };
        }
    } catch (e: any) {
        console.error('Error seeding database:', e);
        return { error: e.message || 'An unknown error occurred.' };
    }
}
