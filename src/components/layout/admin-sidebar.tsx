

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
  ChevronsUpDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const topNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

const productNavItems = [
    { href: "/admin/products", label: "All Products" },
    { href: "/admin/products/digital", label: "Digital Products" },
    { href: "/admin/products/categories", label: "Categories" },
    { href: "/admin/products/brands", label: "Brands" },
    { href: "/admin/products/attributes", label: "Attributes" },
    { href: "/admin/products/reviews", label: "Reviews" },
    { href: "/admin/products/import", label: "Bulk Import" },
    { href: "/admin/products/export", label: "Bulk Export" },
];

const bottomNavItems = [
    { href: "/admin/inventory", label: "Inventory", icon: Boxes },
    { href: "/admin/users", label: "Customers", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: LineChart },
    { href: "/admin/club-points", label: "Club Points", icon: Award },
    { href: "/admin/chat", label: "Chat", icon: MessageSquare },
];


export function AdminSidebar() {
    const pathname = usePathname();
    const [isProductsOpen, setIsProductsOpen] = useState(() => pathname.startsWith('/admin/products'));

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
                  {topNavItems.map((item) => (
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
                  
                  <Collapsible open={isProductsOpen} onOpenChange={setIsProductsOpen} className="w-full space-y-1">
                    <CollapsibleTrigger asChild>
                      <Button variant={pathname.startsWith('/admin/products') ? "default" : "ghost"} className="justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Products
                        </div>
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 pt-1 space-y-1">
                      {productNavItems.map((item) => (
                        <Button
                          key={item.href}
                          asChild
                          variant={pathname === item.href ? "secondary" : "ghost"}
                          className="justify-start w-full"
                          size="sm"
                        >
                          <Link href={item.href}>
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {bottomNavItems.map((item) => (
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
