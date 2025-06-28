
"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

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
                let userDocSnap = await getDoc(doc(db, "users", firebaseUser.uid));
                let userRole: UserRole | undefined;

                if (userDocSnap.exists()) {
                    userRole = userDocSnap.data().role;
                } else {
                    userDocSnap = await getDoc(doc(db, "customers", firebaseUser.uid));
                    if (userDocSnap.exists()) {
                        userRole = userDocSnap.data().role;
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
