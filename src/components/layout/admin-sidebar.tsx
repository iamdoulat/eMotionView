

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
  Home,
  Boxes,
  Award,
  MessageSquare,
  ChevronsUpDown,
  Tag,
  Palette,
  Fingerprint,
  Building,
  FileDown,
  FileUp,
  UserCog,
  Settings,
  SlidersHorizontal,
  LayoutTemplate,
  Image,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const topNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

const productNavItems = [
    { href: "/admin/products", label: "All Products", icon: Package },
    { href: "/admin/products/digital", label: "Digital Products", icon: Fingerprint },
    { href: "/admin/products/categories", label: "Categories", icon: Boxes },
    { href: "/admin/products/brands", label: "Brands", icon: Tag },
    { href: "/admin/products/attributes", label: "Attributes", icon: Palette },
    { href: "/admin/products/suppliers", label: "Suppliers", icon: Building },
    { href: "/admin/products/reviews", label: "Reviews", icon: MessageSquare },
    { href: "/admin/products/import", label: "Bulk Import", icon: FileUp },
    { href: "/admin/products/export", label: "Bulk Export", icon: FileDown },
];

const mainNavItems = [
    { href: "/admin/inventory", label: "Inventory", icon: Boxes },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/users", label: "Staff", icon: UserCog },
    { href: "/admin/analytics", label: "Analytics", icon: LineChart },
    { href: "/admin/club-points", label: "Club Points", icon: Award },
];

const settingsNavItems = [
    { href: "/admin/settings/general", label: "General Settings", icon: SlidersHorizontal },
    { href: "/admin/settings/homepage", label: "Homepage Settings", icon: LayoutTemplate },
    { href: "/admin/settings/homepage-hero", label: "Homepage Hero", icon: Image },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isProductsOpen, setIsProductsOpen] = useState(() => pathname.startsWith('/admin/products'));
    const [isSettingsOpen, setIsSettingsOpen] = useState(() => pathname.startsWith('/admin/settings'));

    return (
        <aside className="sticky top-24">
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline">Admin Panel</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 p-4 min-h-[calc(100vh-8rem)]">
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
                    <CollapsibleContent className="pt-1 space-y-1">
                      {productNavItems.map((item) => (
                        <Button
                          key={item.href}
                          asChild
                          variant={pathname === item.href ? "secondary" : "ghost"}
                          className="justify-start w-full"
                          size="sm"
                        >
                          <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {mainNavItems.map((item) => (
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

                  <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen} className="w-full space-y-1">
                    <CollapsibleTrigger asChild>
                      <Button variant={pathname.startsWith('/admin/settings') ? "default" : "ghost"} className="justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </div>
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-1 space-y-1">
                      {settingsNavItems.map((item) => (
                        <Button
                          key={item.href}
                          asChild
                          variant={pathname === item.href ? "secondary" : "ghost"}
                          className="justify-start w-full"
                          size="sm"
                        >
                          <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="flex-grow" />
              </CardContent>
          </Card>
        </aside>
    );
}
