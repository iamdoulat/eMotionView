
"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const ADMIN_ROLES = ['admin', 'manager', 'staff'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  const isAuthorized = Boolean(role && ADMIN_ROLES.includes(role.toLowerCase()));

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/sign-in?redirect=/admin');
      } else if (!isAuthorized) {
        router.replace('/account'); // Redirect non-staff users to their account page
      }
    }
  }, [user, isAuthorized, isLoading, router]);

  if (isLoading || !user || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-1">
          <AdminSidebar />
        </div>
        <div className="lg:col-span-4 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
