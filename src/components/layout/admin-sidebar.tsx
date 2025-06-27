

"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  Settings,
  Home,
  Boxes,
  Award,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/inventory", label: "Inventory", icon: Boxes },
    { href: "/admin/users", label: "Customers", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: LineChart },
    { href: "/admin/club-points", label: "Club Points", icon: Award },
    { href: "/admin/chat", label: "Chat", icon: MessageSquare },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="sticky top-24">
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline">Admin Panel</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 p-4">
                   <Button asChild variant="outline" className="justify-start">
                      <Link href="/">
                          <Home className="mr-2 h-4 w-4" />
                          Back to Store
                      </Link>
                  </Button>
                  {navItems.map((item) => (
                      <Button
                          key={item.href}
                          asChild
                          variant={pathname.startsWith(item.href) && (item.href !== "/admin" || pathname === "/admin")  ? "default" : "ghost"}
                          className="justify-start"
                      >
                          <Link href={item.href}>
                              <item.icon className="mr-2 h-4 w-4" />
                              {item.label}
                          </Link>
                      </Button>
                  ))}
                   <div className="mt-auto pt-4">
                      <Button asChild variant="ghost" className="justify-start w-full">
                          <Link href="/admin/settings">
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                          </Link>
                      </Button>
                   </div>
              </CardContent>
          </Card>
        </aside>
    );
}
