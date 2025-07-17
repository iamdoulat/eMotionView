
"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, Menu, Phone, User, Heart, LayoutGrid, LogOut, Package, Tag, Building, ChevronsRight, Boxes, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { useCart } from "@/hooks/use-cart"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth"
import { Skeleton } from "../ui/skeleton"

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

interface HeaderProps {
    logoUrl?: string;
    companyName?: string;
}

export function Header({ logoUrl, companyName = "eMotionView" }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const { cartCount, isInitialized: isCartInitialized } = useCart();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWrapperRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/sign-in');
    router.refresh();
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
        setIsSearchFocused(false);
    }
  }

  const searchInput = (
    <Input 
      type="search" 
      placeholder="Search products, brands..." 
      className={cn("rounded-full h-10 pr-11 md:h-12 md:pr-14 border border-accent focus:ring-1 focus:ring-accent")} 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onFocus={() => setIsSearchFocused(true)}
    />
  );
  
  const searchButton = (
    <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 md:h-10 md:w-10">
      <Search className={cn("h-5 w-5 transition-transform duration-500", isSearchFocused && "rotate-[360deg]")} />
    </Button>
  );

  const CartButton = ({ className }: { className?: string }) => (
    <Button variant="ghost" asChild className={cn("relative h-10 w-10", className)}>
      <Link href="/cart" aria-label="Shopping Cart">
        <ShoppingCart className="h-6 w-6" />
        {isCartInitialized && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs bg-blue-600 text-primary-foreground hover:bg-blue-700 border-none">
            {cartCount > 0 ? cartCount : 0}
          </Badge>
        )}
      </Link>
    </Button>
  );

  const AccountLinks = ({isMobile = false}: {isMobile?: boolean}) => {
    if (isAuthLoading) {
      return isMobile ? null : <Skeleton className="h-4 w-12" />;
    }

    if (currentUser) {
        return isMobile ? (
            <>
                <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/account"><User className="mr-2 h-4 w-4" /> My Account</Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-destructive hover:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </>
        ) : (
            <button onClick={handleLogout} className="flex items-center gap-1 hover:text-primary text-sm">
                <LogOut className="h-4 w-4" />
                Logout
            </button>
        )
    }

    return isMobile ? (
        <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/sign-in"><User className="mr-2 h-4 w-4" /> Login / Sign Up</Link>
        </Button>
    ) : (
        <Link href="/sign-in" className="flex items-center gap-1 hover:text-primary text-sm">
            <User className="h-4 w-4" />
            Login
        </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm shadow-md" ref={searchWrapperRef}>
      {/* Top Bar (Desktop only) */}
      <div className={cn(
          "hidden border-b bg-secondary/50 transition-all duration-300 overflow-hidden md:block",
          isScrolled ? 'max-h-0 py-0 border-transparent' : 'max-h-12 pt-3 pb-2.5 border-border'
      )}>
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <div className="font-bold text-sm">
            <span>Biggest Smart Gadget & SmartPhone Collection</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="tel:09677460460" className="flex items-center gap-1 hover:text-primary">
              <Phone className="h-4 w-4" />
              09677460460
            </a>
            <span className="text-muted-foreground">|</span>
             <AccountLinks />
             <span className="text-muted-foreground">|</span>
             <Link href="/track-order" className="flex items-center gap-1 hover:text-primary">
                <MapPin className="h-4 w-4" />
                Order Track
            </Link>
          </div>
        </div>
      </div>
      
      {/* ======================================================= */}
      {/* Main Header - Unified for Mobile and Desktop            */}
      {/* Uses responsive classes to show/hide/rearrange elements */}
      {/* ======================================================= */}
      
      {/* Main Bar */}
      <div className={cn(
        "container mx-auto flex items-center justify-between gap-4 px-4 transition-all duration-300",
        "h-16 md:h-20", // Base heights for mobile and desktop
        isScrolled && "md:h-16" // Scrolled height for desktop
      )}>
        {/* --- Left Group --- */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
              <div className="bg-primary p-4">
                <Link href="/" className="flex items-center gap-2">
                  <Image src="https://placehold.co/40x40/FFFFFF/8B2BE2.png" alt={`${companyName} Logo`} width={40} height={40} data-ai-hint="logo initial"/>
                  <span className="font-bold text-xl text-primary-foreground">{companyName}</span>
                </Link>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    <h3 className="font-semibold px-2 text-lg mb-2">Account</h3>
                    <AccountLinks isMobile={true} />
                </div>
                <Separator/>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold px-2 text-lg mb-2">All Categories</h3>
                  {categoryLinks.map(link => (
                    <Button variant="ghost" asChild key={link.name} className="w-full justify-start">
                        <Link href={link.href}>
                        {link.name}
                        </Link>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Desktop Logo */}
          <Link href="/" className="hidden items-center gap-2 md:flex">
             {logoUrl ? (
                <Image 
                    src={logoUrl}
                    alt={`${companyName} Logo`}
                    width={isScrolled ? 120 : 150}
                    height={isScrolled ? 32 : 40}
                    className="transition-all duration-300 h-auto"
                    style={{width: isScrolled ? '120px' : '150px'}}
                    data-ai-hint="logo globe"
                />
             ) : (
                <span className={cn("font-bold font-headline text-foreground transition-all duration-300", isScrolled ? 'text-xl' : 'text-2xl')}>
                    {companyName}
                </span>
             )}
          </Link>

          {/* Desktop Category Dropdown (appears on scroll) */}
          <div className={cn("hidden lg:flex items-center transition-opacity duration-300", isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button>
                          <LayoutGrid className="mr-2 h-4 w-4" />
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
        </div>

        {/* --- Center Group --- */}
        <div className="flex flex-1 justify-center items-center md:px-4">
            {/* Mobile Logo (acts as a spacer on small screens) */}
             <Link href="/" className="flex items-center gap-2 md:hidden">
              <span className="font-bold font-headline text-xl text-foreground">{companyName}</span>
            </Link>

            {/* Desktop Search */}
            <div className="w-full max-w-2xl hidden md:block">
              <div className={cn("w-full transition-all duration-300", isScrolled ? 'max-w-lg' : 'max-w-2xl')}>
                  <form className="relative" onSubmit={handleSearchSubmit}>
                      {searchInput}
                      {searchButton}
                  </form>
              </div>
            </div>
        </div>
        
        {/* --- Right Group --- */}
        <div className="flex flex-shrink-0 items-center justify-end gap-1">
          <Button variant="ghost" size="icon" asChild className="hidden lg:inline-flex">
              <Link href="/wishlist">
                  <Heart className="h-6 w-6" />
                  <span className="sr-only">Wishlist</span>
              </Link>
          </Button>

          <CartButton />
          
          <div className="hidden lg:inline-flex items-center">
            <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Account">
                          <User className="h-6 w-6" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      {isAuthLoading ? (
                          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                      ) : currentUser ? (
                          <>
                              <DropdownMenuItem asChild>
                                  <Link href="/account">My Account</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleLogout}>
                                  Logout
                              </DropdownMenuItem>
                          </>
                      ) : (
                          <DropdownMenuItem asChild>
                              <Link href="/sign-in">Sign In</Link>
                          </DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="container mx-auto px-4 py-3 border-t relative md:hidden">
          <form className="relative" onSubmit={handleSearchSubmit}>
             {searchInput}
             {searchButton}
          </form>
      </div>
    </header>
  )
}
