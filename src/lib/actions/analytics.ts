
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';

export async function trackDailyVisitor() {
    try {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const docRef = doc(db, 'analytics', `daily_visits_${today}`);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await setDoc(docRef, {
                count: increment(1),
                date: today,
            }, { merge: true });
        } else {
            await setDoc(docRef, {
                count: 1,
                date: today,
            });
        }
        return { success: true };
    } catch (error) {
        console.error("Error tracking visitor: ", error);
        return { success: false, error: "Could not track visitor." };
    }
}
