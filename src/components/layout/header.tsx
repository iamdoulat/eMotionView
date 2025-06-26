"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, Heart, User, Menu, Bot, GitCompareArrows } from "lucide-react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Products" },
  { href: "/recommendations", label: "AI Advisor", icon: <Bot className="h-4 w-4 mr-1" /> },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        
        <div className="flex items-center gap-4">
           {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
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
                <Link href="/account" className="text-lg font-medium">Account</Link>
                <Link href="/wishlist" className="text-lg font-medium">Wishlist</Link>
                <Link href="/cart" className="text-lg font-medium">Cart</Link>
                <Link href="#" className="text-lg font-medium">Compare</Link>
              </div>
            </SheetContent>
          </Sheet>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold font-headline text-2xl text-primary">eMotionView</span>
          </Link>
        </div>

        {/* Centered Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 justify-center px-8">
          <div className="w-full max-w-xl">
            <form>
              <div className="relative">
                <Input type="search" placeholder="Search for products (e.g. drone, laptop)" className="h-12 pr-14 rounded-md border-2 border-primary/20 focus:border-primary focus:ring-0" />
                <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Right side Icons */}
        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
            <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex flex-col h-auto p-1">
              <Link href="#" aria-label="Compare Products">
                <GitCompareArrows className="h-6 w-6" />
                <span className="text-xs">Compare</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex flex-col h-auto p-1">
              <Link href="/sign-in" aria-label="User Account">
                <User className="h-6 w-6" />
                 <span className="text-xs">Account</span>
              </Link>
            </Button>
             <Button variant="ghost" size="icon" asChild className="flex-col h-auto p-1">
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-6 w-6" />
                 <span className="hidden sm:inline text-xs">Wishlist</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="flex-col h-auto p-1">
              <Link href="/cart" aria-label="Shopping Cart">
                <ShoppingCart className="h-6 w-6" />
                <span className="hidden sm:inline text-xs">Cart</span>
              </Link>
            </Button>
        </div>
      </div>
      {/* Search Bar - Mobile */}
      <div className="md:hidden px-4 pb-4 border-b">
           <form>
              <div className="relative">
                <Input type="search" placeholder="Search..." className="h-10 pr-11 rounded-md" />
                <Button type="submit" size="icon" className="absolute right-0 top-0 h-10 w-10 rounded-md bg-primary text-primary-foreground">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
      </div>
    </header>
  )
}
