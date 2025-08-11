
"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ShoppingBag, Heart, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/account/profile", label: "Profile", icon: User },
    { href: "/account/orders", label: "Orders", icon: ShoppingBag },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
];

export function AccountSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await router.push('/api/auth/sign-out');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <Button
                        key={item.href}
                        asChild
                        variant={pathname.startsWith(item.href) ? "default" : "ghost"}
                        className="justify-start"
                    >
                        <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Link>
                    </Button>
                ))}
                <Button onClick={handleSignOut} variant="ghost" className="justify-start text-destructive hover:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </CardContent>
        </Card>
    );
}
