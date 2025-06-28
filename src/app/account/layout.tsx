
"use client";

import { AccountSidebar } from "@/components/layout/account-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const CUSTOMER_ROLES = ['Customer'];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, role, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace('/sign-in');
            } else if (role && !CUSTOMER_ROLES.includes(role)) {
                router.replace('/admin');
            }
        }
    }, [user, role, isLoading, router]);

    if (isLoading || !user || (role && !CUSTOMER_ROLES.includes(role))) {
        return (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <AccountSidebar />
        </aside>
        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}
