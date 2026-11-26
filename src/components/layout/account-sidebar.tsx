
"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ShoppingBag, Heart, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
    { href: "/account/profile", label: "Profile", icon: User },
    { href: "/account/orders", label: "Orders", icon: ShoppingBag },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
];

export function AccountSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { role } = useAuth();
    const isAdmin = Boolean(role && ['admin', 'manager', 'staff'].includes(role.toLowerCase()));

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out client:", error);
        }
        await router.push('/api/auth/sign-out');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {isAdmin && (
                    <Button
                        asChild
                        variant="outline"
                        className="justify-start border-blue-600/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold mb-1"
                    >
                        <Link href="/admin">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Admin Panel
                        </Link>
                    </Button>
                )}
                {navItems.map((item) => (
                    <Button
                        key={item.href}
                        asChild
                        variant={pathname.startsWith(item.href) ? "default" : "ghost"}
                        className={cn(
                            "justify-start transition-colors",
                            pathname.startsWith(item.href)
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "hover:bg-secondary hover:text-foreground"
                        )}
                    >
                        <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Link>
                    </Button>
                ))}
                <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </CardContent>
        </Card>
    );
}
