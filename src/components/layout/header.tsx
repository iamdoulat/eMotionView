"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, Menu, Phone, User, MapPin, LayoutGrid } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mainNavLinks = [
  { href: "#", label: "Campaign" },
  { href: "/products", label: "Trending" },
  { href: "#", label: "Brands" },
  { href: "#", label: "Outlets" },
  { href: "#", label: "Support" },
];

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
    { name: 'Health & Outdoors', href: '/products?category=Accessories' },
]


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-sm">
      {/* Top Bar */}
      <div className="hidden md:block bg-secondary/50 text-xs text-muted-foreground">
        <div className="container mx-auto flex h-8 items-center justify-between px-4">
          <div>
            <span>Biggest Smart Gadget & SmartPhone Collection</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:09677460460" className="flex items-center gap-1 hover:text-primary">
              <Phone className="h-4 w-4" />
              09677460460
            </a>
            <span className="text-gray-300">|</span>
            <Link href="/sign-in" className="flex items-center gap-1 hover:text-primary">
              <User className="h-4 w-4" />
              Login
            </Link>
             <span className="text-gray-300">|</span>
             <Link href="/account/orders" className="flex items-center gap-1 hover:text-primary">
                <MapPin className="h-4 w-4" />
                Order Track
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
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
                    <hr className="my-4"/>
                    {mainNavLinks.map(link => (
                        <Link key={link.href} href={link.href} className="block py-2 text-muted-foreground hover:text-primary">
                            {link.label}
                        </Link>
                    ))}
                </div>
            </SheetContent>
          </Sheet>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
             <Image src="https://placehold.co/50x50/FFFFFF/000000.png" alt="eMotionView Logo" width={40} height={40} className="hidden md:block" data-ai-hint="logo globe"/>
            <span className="font-bold font-headline text-2xl text-foreground">eMotionView</span>
          </Link>
        </div>

        {/* Centered Search Bar */}
        <div className="hidden md:flex flex-1 justify-center px-8">
          <div className="w-full max-w-2xl">
            <form>
              <div className="relative">
                <Input type="search" placeholder="Search the product" className="h-12 pr-14 rounded-full border-2 border-primary/30 focus:border-primary focus:ring-primary/20" />
                <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Right side Icons */}
        <div className="flex items-center justify-end">
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart" aria-label="Shopping Cart">
                <ShoppingCart className="h-6 w-6" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">1</Badge>
              </Link>
            </Button>
        </div>
      </div>
      
       {/* Bottom Bar / Main Navigation */}
      <div className="hidden md:block border-t">
        <div className="container mx-auto flex h-14 items-center justify-start gap-8 px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="font-bold bg-primary hover:bg-primary/90">
                    <LayoutGrid className="mr-2 h-5 w-5" />
                    All Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[250px] bg-background">
                {categoryLinks.map(link => (
                    <DropdownMenuItem key={link.name} asChild>
                        <Link href={link.href} className="flex items-center gap-2 py-2">
                            {link.name}
                        </Link>
                    </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <nav className="flex items-center gap-6 text-sm font-medium text-foreground">
                {mainNavLinks.map(link => (
                    <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                ))}
            </nav>
        </div>
      </div>

       {/* Search Bar - Mobile */}
      <div className="md:hidden px-4 pb-4 border-t">
           <form>
              <div className="relative">
                <Input type="search" placeholder="Search..." className="h-10 pr-11 rounded-full" />
                <Button type="submit" size="icon" className="absolute right-0 top-0 h-10 w-10 rounded-full bg-primary text-primary-foreground">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
      </div>

    </header>
  )
}
