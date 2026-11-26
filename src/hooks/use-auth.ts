"use client";

import { useState, useEffect } from 'react';
import { onIdTokenChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useHasMounted } from './use-has-mounted';

export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Customer';

export interface AuthUser extends FirebaseUser {
    role?: UserRole;
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasMounted = useHasMounted();

    const fetchUserRole = async (firebaseUser: FirebaseUser): Promise<UserRole | undefined> => {
        try {
            const token = await firebaseUser.getIdToken();
            const resMe = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resMe.ok) {
                const data = await resMe.json();
                if (data.role) return data.role;
            }
        } catch {}

        try {
            const res = await fetch(`/api/data/users?id=${encodeURIComponent(firebaseUser.uid)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.role) return data.role;
            }
            const res2 = await fetch(`/api/data/customers?id=${encodeURIComponent(firebaseUser.uid)}`);
            if (res2.ok) {
                const data = await res2.json();
                if (data.role) return data.role;
            }
        } catch {}
        return undefined;
    };

    useEffect(() => {
        if (!hasMounted) return;

        const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const role = await fetchUserRole(firebaseUser);
                setUser({ ...firebaseUser, role });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [hasMounted]);

    return { user, role: user?.role, isLoading: isLoading || !hasMounted };
}
