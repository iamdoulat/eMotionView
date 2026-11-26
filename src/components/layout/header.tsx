
"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, Menu, Phone, User, Heart, LayoutGrid, LogOut, MapPin, X, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "../ui/skeleton"
import { ClientOnly } from "../client-only"
import { ThemeToggle } from "../theme-toggle"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

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
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const showCategoryDropdown = !isHomePage || isScrolled;
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
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out client:", error);
    }
    await router.push('/api/auth/sign-out');
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
      <span className="flex items-center gap-2"><Search className={cn("h-5 w-5 transition-transform duration-500", isSearchFocused && "rotate-[360deg]")} /></span>
    </Button>
  );

  const headerActionButtonClass = "h-10 w-10 rounded-full border-2 border-blue-600 dark:border-blue-500 bg-background hover:bg-blue-50/70 dark:hover:bg-blue-950/40 text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-sm flex items-center justify-center";

  const CartButton = ({ className }: { className?: string }) => (
    <ClientOnly fallback={
      <div className={cn("relative flex items-center justify-center", headerActionButtonClass, className)}>
        <ShoppingCart className="h-5 w-5" />
      </div>
    }>
      <Button
        variant="ghost"
        size="icon"
        asChild
        className={cn("relative", headerActionButtonClass, className)}
      >
        <Link href="/cart" aria-label="Shopping Cart">
          <ShoppingCart className="h-5 w-5" />
          {isCartInitialized && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs bg-blue-600 text-primary-foreground hover:bg-blue-700 border-2 border-background">
              {cartCount > 0 ? cartCount : 0}
            </Badge>
          )}
        </Link>
      </Button>
    </ClientOnly>
  );

  const AccountLinks = ({ isMobile = false, inHeader = false }: { isMobile?: boolean; inHeader?: boolean }) => {
    if (isAuthLoading) {
      return isMobile ? null : inHeader ? (
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-label="Account"
          className={cn(headerActionButtonClass, "opacity-75 cursor-default")}
        >
          <User className="h-5 w-5" />
        </Button>
      ) : (
        <Skeleton className="h-6 w-24" />
      );
    }

    if (user) {
      if (isMobile) {
        return (
          <div className="space-y-1">
            <SheetClose asChild>
              <Button variant="ghost" size="sm" asChild className="w-full justify-start h-8 px-2">
                <Link href="/account"><User className="mr-2 h-4 w-4" /> My Account</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start h-8 px-2 text-destructive hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </SheetClose>
          </div>
        );
      }

      if (inHeader) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Account"
                className={headerActionButtonClass}
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/account">My Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }

      return (
        <div className="flex items-center gap-1 hover:text-primary text-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Account" className="h-auto p-0 hover:bg-transparent">
                <User className="h-4 w-4 mr-1" /> My Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/account">My Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    if (isMobile) {
      return (
        <SheetClose asChild>
          <Button variant="ghost" size="sm" asChild className="w-full justify-start h-8 px-2">
            <Link href="/sign-in"><User className="mr-2 h-4 w-4" /> Login / Sign Up</Link>
          </Button>
        </SheetClose>
      );
    }

    if (inHeader) {
      return (
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="Account"
          className={headerActionButtonClass}
        >
          <Link href="/sign-in">
            <User className="h-5 w-5" />
            <span className="sr-only">Login / Sign In</span>
          </Link>
        </Button>
      );
    }

    return (
      <Link href="/sign-in" className="flex items-center gap-1 hover:text-primary text-sm">
        <User className="h-4 w-4" />
        Login
      </Link>
    );
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
            <ClientOnly fallback={<Skeleton className="h-4 w-12" />}>
              <AccountLinks />
            </ClientOnly>
            <span className="text-muted-foreground">|</span>
            <Link href="/track-order" className="flex items-center gap-1 hover:text-primary">
              <MapPin className="h-4 w-4" />
              Order Track
            </Link>
            <span className="text-muted-foreground">|</span>
            <ThemeToggle />
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
            <SheetContent
              side="left"
              hideCloseButton
              className="w-[300px] p-0 flex flex-col"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="bg-primary px-3 py-2.5 flex items-center justify-between gap-2 shrink-0">
                <SheetClose asChild>
                  <Link href="/" className="flex items-center gap-2 min-w-0">
                    <Image src={logoUrl || "/icon.png"} alt={`${companyName} Logo`} width={28} height={28} className="rounded bg-white p-0.5 object-contain shrink-0" data-ai-hint="logo initial" />
                    <span className="font-bold text-sm text-primary-foreground truncate">{companyName}</span>
                  </Link>
                </SheetClose>
                <div className="flex items-center gap-1.5 shrink-0">
                  <ThemeToggle />
                  <SheetClose asChild>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary hover:bg-white/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span className="sr-only">Close</span>
                    </button>
                  </SheetClose>
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="px-2 py-2">
                  <h3 className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    All Categories
                  </h3>
                  <div className="space-y-0.5">
                    {categoryLinks.map(link => (
                      <SheetClose asChild key={link.name}>
                        <Link
                          href={link.href}
                          className="relative flex items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors overflow-hidden group"
                        >
                          {/* Gradient background: primary/70 on left → transparent on right */}
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ background: 'linear-gradient(to right, hsl(var(--primary)/0.12) 0%, transparent 100%)' }}
                          />
                          {/* Always-visible subtle left accent */}
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-md"
                            style={{ background: 'linear-gradient(to right, hsl(var(--primary)/0.07) 0%, transparent 70%)' }}
                          />
                          <span className="relative truncate">{link.name}</span>
                          <ChevronRight className="relative h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              <div className="shrink-0 border-t bg-secondary/40 px-3 py-2.5">
                <h3 className="px-1 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </h3>
                <ClientOnly>
                  <AccountLinks isMobile={true} />
                </ClientOnly>
              </div>
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
                style={{ width: isScrolled ? '120px' : '150px' }}
                data-ai-hint="logo globe"
              />
            ) : (
              <span className={cn("font-bold font-headline text-foreground transition-all duration-300", isScrolled ? 'text-xl' : 'text-2xl')}>
                {companyName}
              </span>
            )}
          </Link>

          {/* Desktop Category Dropdown (appears on scroll or on non-home pages) */}
          <div className={cn(
            "hidden lg:flex items-center ml-5 lg:ml-7 shrink-0 transition-opacity duration-300",
            showCategoryDropdown ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                  <LayoutGrid className="mr-1.5 h-4 w-4" />
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
        <div className="flex flex-shrink-0 items-center justify-end gap-2.5 md:gap-3">
          <ClientOnly fallback={
            <div className={cn("hidden md:inline-flex items-center justify-center", headerActionButtonClass)}>
              <Heart className="h-5 w-5" />
            </div>
          }>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn("hidden md:inline-flex", headerActionButtonClass)}
            >
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>
          </ClientOnly>

          <CartButton />

          <ClientOnly fallback={
            <div className={cn("hidden md:inline-flex items-center justify-center", headerActionButtonClass)}>
              <User className="h-5 w-5" />
            </div>
          }>
            <div className="hidden md:inline-flex items-center">
              <AccountLinks inHeader={true} />
            </div>
          </ClientOnly>
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
