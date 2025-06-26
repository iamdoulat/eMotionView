"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, Menu, Phone, User, MapPin, Heart, LayoutGrid } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const categoryLinks = [
    { name: 'Smart Watches', href: '/products?category=Wearables' },
    { name: 'Smart Phones', href: '/products?category=Smartphones' },
    { name: 'Headphones', href: '/products?category=Audio' },
    { name: 'Smart TV & Accessories', href: '/products?category=Smart+Home' },
    { name: 'Computer & Accessories', href: '/products?category=Laptops' },
    { name: 'Wireless Speakers', href: '/products?category=Audio' },
    { name: 'Security Cameras', href: '/products?category=Smart+Home' },
    { name: 'Smart Home Appliances', href: '/products?category=Smart+Home' },
    { name: 'Charger & Cables', href: '/products?category=Accessories' },
    { name: 'Powerbanks', href: '/products?category=Accessories' },
    { name: 'Network Components', href: '/products?category=Accessories' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm">
      {/* Top Bar (hides on scroll) */}
      <div className={cn(
        "hidden md:block bg-secondary/50 text-black transition-all duration-300",
        isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-8'
      )}>
        <div className="container mx-auto flex h-full items-center justify-between px-4 text-xs">
          <div>
            <span>Biggest Smart Gadget & SmartPhone Collection</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:09677460460" className="flex items-center gap-1 hover:text-primary">
              <Phone className="h-4 w-4" />
              09677460460
            </a>
            <span className="text-muted-foreground">|</span>
            <Link href="/sign-in" className="flex items-center gap-1 hover:text-primary">
              <User className="h-4 w-4" />
              Login
            </Link>
             <span className="text-muted-foreground">|</span>
             <Link href="/account/orders" className="flex items-center gap-1 hover:text-primary">
                <MapPin className="h-4 w-4" />
                Order Track
            </Link>
          </div>
        </div>
      </div>
      
      {/* Normal Header (Unscrolled) */}
      <div className={cn("border-b", isScrolled ? 'hidden' : 'block')}>
        <div className="container mx-auto hidden h-20 items-center justify-between gap-4 px-4 md:flex">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="https://placehold.co/50x50/FFFFFF/000000.png" alt="eMotionView Logo" width={40} height={40} data-ai-hint="logo globe"/>
            <span className="font-bold font-headline text-2xl text-foreground">eMotionView</span>
          </Link>
          <div className="hidden md:flex flex-1 justify-center px-8">
            <form className="w-full max-w-2xl">
              <div className="relative">
                <Input type="search" placeholder="Search the product" className="h-12 pr-14 rounded-full border-2 border-primary/30 focus:border-primary focus:ring-primary/20" />
                <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="icon" asChild className="relative border border-blue-600">
              <Link href="/cart" aria-label="Shopping Cart">
                <ShoppingCart className="h-8 w-8" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs bg-blue-600 text-primary-foreground hover:bg-blue-700 border-none">3</Badge>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky Header (Scrolled) - Re-designed to match reference image */}
      <div className={cn("border-b shadow-md", isScrolled ? 'block' : 'hidden')}>
        <div className="container mx-auto hidden h-16 items-center justify-between gap-4 px-4 md:flex">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <Image src="https://placehold.co/50x50/FFFFFF/000000.png" alt="eMotionView Logo" width={32} height={32} data-ai-hint="logo globe"/>
                <span className="font-bold font-headline text-xl text-foreground">eMotionView</span>
            </Link>

            <div className="hidden lg:flex">
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button>
                          <LayoutGrid className="h-5 w-5" />
                          All Categories
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                      {categoryLinks.map((link) => (
                          <DropdownMenuItem key={link.name} asChild>
                               <Link href={link.href}>{link.name}</Link>
                          </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1 flex justify-center px-4">
                 <form className="w-full max-w-lg">
                    <div className="relative">
                        <Input type="search" placeholder="Search the product..." className="h-10 pr-12 rounded-full" />
                        <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Search className="h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </div>

            <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/wishlist">
                        <Heart className="h-6 w-6" />
                        <span className="sr-only">Wishlist</span>
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="relative border border-blue-600">
                <Link href="/cart" aria-label="Shopping Cart">
                    <ShoppingCart className="h-8 w-8" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs bg-blue-600 text-primary-foreground hover:bg-blue-700 border-none">3</Badge>
                </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/sign-in" aria-label="Account">
                        <User className="h-6 w-6" />
                    </Link>
                </Button>
            </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <div className="bg-primary p-4">
                <Link href="/" className="flex items-center gap-2">
                  <Image src="https://placehold.co/40x40/FFFFFF/8B2BE2.png" alt="eMotionView Logo" width={40} height={40} data-ai-hint="logo initial"/>
                  <span className="font-bold text-xl text-primary-foreground">eMotionView</span>
                </Link>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg mb-2">All Categories</h3>
                {categoryLinks.map(link => (
                  <Link key={link.name} href={link.href} className="block py-2 text-muted-foreground hover:text-primary">
                    {link.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold font-headline text-xl text-foreground">eMotionView</span>
          </Link>
          <Button variant="ghost" size="icon" asChild className="relative border border-blue-600">
            <Link href="/cart" aria-label="Shopping Cart">
              <ShoppingCart className="h-8 w-8" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs bg-blue-600 text-primary-foreground hover:bg-blue-700 border-none">3</Badge>
            </Link>
          </Button>
        </div>
        <div className="px-4 py-3 border-b">
          <form>
            <div className="relative">
              <Input type="search" placeholder="Search..." className="h-10 pr-11 rounded-full" />
              <Button type="submit" size="icon" className="absolute right-0 top-0 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </header>
  )
}
