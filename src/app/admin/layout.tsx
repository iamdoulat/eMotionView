
"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const ADMIN_ROLES = ['Admin', 'Manager', 'Staff'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
        if (!user) {
             router.replace('/sign-in');
        } else if (role && !ADMIN_ROLES.includes(role)) {
             router.replace('/account'); // Redirect customers to their account page
        }
    }
  }, [user, role, isLoading, router]);

  if (isLoading || !user || (role && !ADMIN_ROLES.includes(role))) {
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
        <main className="lg:col-span-4">
          {children}
        </main>
      </div>
    </div>
  );
}
