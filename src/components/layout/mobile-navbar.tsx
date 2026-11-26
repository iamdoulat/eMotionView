"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { ClientOnly } from "@/components/client-only";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: LayoutGrid },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account", label: "Account", icon: User },
];

export function MobileNavbar() {
  const pathname = usePathname();
  const { cartCount, isInitialized } = useCart();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-2.5 inset-x-3 mx-auto max-w-md z-50 rounded-full border border-border/70 bg-background/90 backdrop-blur-lg shadow-lg shadow-black/10 dark:shadow-black/40 px-2 py-1.5"
    >
      <div className="grid grid-cols-5 items-center gap-1">
        {navItems.map((item) => {
          const isActive =
            (item.href === "/" && pathname === "/") ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-full py-1.5 px-2 transition-all duration-300 ease-out group active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "w-5 h-5 mb-0.5 transition-transform duration-300 ease-out",
                    isActive
                      ? "-translate-y-0.5 scale-110"
                      : "group-hover:-translate-y-0.5 group-hover:scale-110"
                  )}
                />
                {item.label === "Cart" && (
                  <ClientOnly>
                    {isInitialized && cartCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2.5 h-4 min-w-4 px-1 justify-center rounded-full text-[10px] leading-none ring-2 ring-background transition-transform duration-300 group-hover:scale-110"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </ClientOnly>
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] leading-tight transition-all duration-200",
                  isActive ? "font-semibold" : "font-medium group-hover:font-semibold"
                )}
              >
                {item.label}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 h-0.5 rounded-full bg-primary transition-all duration-300",
                  isActive ? "w-5 opacity-100" : "w-0 opacity-0 group-hover:w-3.5 group-hover:opacity-70"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
