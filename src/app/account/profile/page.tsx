
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [userCollection, setUserCollection] = useState<'customers' | 'users' | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Try fetching from 'customers' first
                const customerDocRef = doc(db, "customers", currentUser.uid);
                let userDocSnap = await getDoc(customerDocRef);
                let collectionName: 'customers' | 'users' | null = 'customers';

                if (!userDocSnap.exists()) {
                    // If not a customer, check if they are a staff/admin in 'users'
                    const userDocRef = doc(db, "users", currentUser.uid);
                    userDocSnap = await getDoc(userDocRef);
                    collectionName = 'users';
                }

                if (userDocSnap.exists()) {
                    setUserCollection(collectionName as 'customers' | 'users');
                    const userData = userDocSnap.data();
                    setName(userData.name || '');
                    setEmail(userData.email || '');
                    setMobile(userData.mobileNumber || '');
                } else {
                    // User exists in Auth but not in Firestore collections, maybe a new signup didn't complete
                    setUserCollection(null);
                }
            } else {
                setUser(null);
                setUserCollection(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!user || !userCollection) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find user data to update. Please try again.' });
            return;
        }
        if (!name || name.trim() === '') {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Full Name is required.' });
            return;
        }
        if (!email || email.trim() === '') {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Email is required.' });
            return;
        }
        if (!mobile || mobile.trim() === '') {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Mobile Number is required.' });
            return;
        }
        setIsSaving(true);
        try {
            const userDocRef = doc(db, userCollection, user.uid);
            await setDoc(userDocRef, {
                name: name,
                email: email, // Note: This doesn't change Firebase Auth email for login
                mobileNumber: mobile,
            }, { merge: true });
            toast({ title: 'Success', description: 'Profile updated successfully.' });
        } catch (error) {
            console.error("Profile update error: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update your profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div>
                <Skeleton className="h-10 w-1/4 mb-6" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-28" />
                    </CardFooter>
                </Card>
                <Card className="mt-8">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-36" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <h1 className="font-headline text-3xl font-bold text-foreground mb-6">Profile Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSaving} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                        <Input id="mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} disabled={isSaving} required />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password. It's a good idea to use a strong password that you're not using elsewhere.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Update Password</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
