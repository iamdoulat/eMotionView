
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
                    let userDocSnap = await getDoc(doc(db, "users", firebaseUser.uid));
                    
                    if (userDocSnap.exists()) {
                        userRole = userDocSnap.data().role;
                    } else {
                        // If not in 'users', check 'customers'
                        const customerDocSnap = await getDoc(doc(db, "customers", firebaseUser.uid));
                        if (customerDocSnap.exists()) {
                            userRole = customerDocSnap.data().role;
                        }
                    }
                } catch (error) {
                    if (error instanceof FirebaseError && error.code !== 'permission-denied') {
                        console.error("Error fetching user data:", error);
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
