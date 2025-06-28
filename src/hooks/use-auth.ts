
"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';

export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Customer';

export interface AuthUser extends FirebaseUser {
    role?: UserRole;
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                let userRole: UserRole | undefined;
                
                try {
                    // Try fetching from 'users' collection first (for Admin/Staff)
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        userRole = userDocSnap.data().role;
                    }
                } catch (error) {
                    // This will likely be a permissions error if the user is a customer. We can ignore it.
                    if (error instanceof FirebaseError && error.code !== 'permission-denied') {
                        console.error("Error fetching staff user data:", error);
                    }
                }

                // If no role was found in 'users', check 'customers' collection.
                if (!userRole) {
                    try {
                        const customerDocRef = doc(db, "customers", firebaseUser.uid);
                        const customerDocSnap = await getDoc(customerDocRef);
                        if (customerDocSnap.exists()) {
                            userRole = customerDocSnap.data().role;
                        }
                    } catch (error) {
                         // This could fail if an admin is not also in the customers collection. Ignore permission errors.
                        if (error instanceof FirebaseError && error.code !== 'permission-denied') {
                            console.error("Error fetching customer data:", error);
                        }
                    }
                }
                
                setUser({ ...firebaseUser, role: userRole });

            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, role: user?.role, isLoading };
}
