"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, Heart, User, Menu, Bot } from "lucide-react"

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/recommendations", label: "AI Recommendations", icon: <Bot className="h-4 w-4 mr-1" /> },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold font-headline text-xl text-primary">eMotionView</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center">
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search products..." className="pl-8 sm:w-64 md:w-80" />
              </div>
            </form>
          </div>
          <nav className="hidden items-center space-x-2 md:flex">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart" aria-label="Shopping Cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/sign-in" aria-label="User Account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                <span className="font-bold font-headline text-xl text-primary">eMotionView</span>
              </Link>
              <div className="flex flex-col space-y-4">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium flex items-center">
                     {link.icon}
                    {link.label}
                  </Link>
                ))}
                <hr/>
                <Link href="/wishlist" className="text-lg font-medium">Wishlist</Link>
                <Link href="/cart" className="text-lg font-medium">Cart</Link>
                <Link href="/sign-in" className="text-lg font-medium">Account</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
