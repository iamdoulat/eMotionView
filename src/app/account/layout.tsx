
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
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/sign-in');
      } else if (role && !CUSTOMER_ROLES.includes(role)) {
        // Allow admins to view order details, but redirect from other account pages
        const isOrderDetailPage = pathname.startsWith('/account/orders/') && pathname !== '/account/orders';
        if (!isOrderDetailPage) {
          router.replace('/admin');
        }
      }
    }
  }, [user, role, isLoading, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Allow admins to view order detail pages
  const isOrderDetailPage = pathname.startsWith('/account/orders/') && pathname !== '/account/orders';
  const isAdminViewingOrder = role && !CUSTOMER_ROLES.includes(role) && isOrderDetailPage;

  if (!isAdminViewingOrder && role && !CUSTOMER_ROLES.includes(role)) {
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
