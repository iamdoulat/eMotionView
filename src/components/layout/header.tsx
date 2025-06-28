
"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, Menu, Phone, User, MapPin, Heart, LayoutGrid, LogOut, Package, Tag, Building, ChevronsRight, Boxes } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { products, categories, brands, suppliers, attributes } from "@/lib/placeholder-data"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { useCart } from "@/hooks/use-cart"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth"
import { Skeleton } from "../ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import { useHasMounted } from "@/hooks/use-has-mounted"

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

type SearchResult = {
    type: 'Product' | 'Category' | 'Brand' | 'Supplier' | 'Attribute';
    name: string;
    href: string;
    context?: string;
    image?: string;
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const { cartCount, isInitialized: isCartInitialized } = useCart();
  
  const hasMounted = useHasMounted();
  const isMobile = useIsMobile();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWrapperRef = useRef<HTMLElement>(null);
  
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearchLoading(true);
    const debounceTimer = setTimeout(() => {
      const query = searchTerm.toLowerCase();

      const productResults: SearchResult[] = products
        .filter(p => p.name.toLowerCase().includes(query))
        .slice(0, 5)
        .map(p => ({ type: 'Product', name: p.name, href: `/products/${p.permalink || p.id}`, image: p.images[0] }));

      const categoryResults: SearchResult[] = categories
        .filter(c => c.name.toLowerCase().includes(query))
        .slice(0, 3)
        .map(c => ({ type: 'Category', name: c.name, href: `/products?category=${encodeURIComponent(c.name)}` }));
      
      const brandResults: SearchResult[] = brands
        .filter(b => b.name.toLowerCase().includes(query))
        .slice(0, 3)
        .map(b => ({ type: 'Brand', name: b.name, href: `/products?brand=${encodeURIComponent(b.name)}` }));

      const supplierResults: SearchResult[] = suppliers
        .filter(s => s.name.toLowerCase().includes(query))
        .slice(0, 2)
        .map(s => ({ type: 'Supplier', name: s.name, href: `/admin/products/suppliers` }));

      const attributeResults: SearchResult[] = [];
      attributes.forEach(attr => {
        attr.values.forEach(val => {
          if (val.toLowerCase().includes(query)) {
            if (!attributeResults.find(r => r.name === val)) {
              attributeResults.push({ type: 'Attribute', name: val, context: attr.name, href: `/products?q=${encodeURIComponent(val)}` });
            }
          }
        });
      });

      const combinedResults = [...productResults, ...categoryResults, ...brandResults, ...supplierResults, ...attributeResults.slice(0, 3)];
      setSearchResults(combinedResults);
      setIsSearchLoading(false);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/sign-in');
    router.refresh();
  };

  const handleResultClick = () => {
    setIsSearchFocused(false);
    setSearchTerm('');
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    (acc[result.type] = acc[result.type] || []).push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (!hasMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-24 hidden md:block" />
          </div>
        </div>
      </header>
    );
  }

  const searchInput = (
    <Input 
      type="search" 
      placeholder="Search products, brands..." 
      className={cn("rounded-full h-10 pr-11 md:h-12 md:pr-14")} 
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

  const searchResultsPanel = (
    <div className="absolute top-full mt-2 w-full rounded-b-lg border-x border-b bg-background shadow-lg z-50 max-h-[70vh]">
      <ScrollArea className="max-h-[calc(70vh-4rem)]">
        {isSearchLoading ? (
          <div className="p-6 text-center text-muted-foreground">Searching...</div>
        ) : searchResults.length > 0 ? (
          <div className="p-2">
            {Object.entries(groupedResults).map(([type, results]) => (
              <div key={type}>
                <h4 className="px-3 py-2 text-xs font-semibold text-muted-foreground">{type}s</h4>
                <ul className="space-y-1">
                  {results.map((result) => (
                    <li key={`${type}-${result.name}`}>
                      <Link href={result.href} className="flex items-center gap-4 p-3 rounded-md hover:bg-accent" onClick={handleResultClick}>
                        {result.image ? (
                          <Image src={result.image} alt={result.name} width={40} height={40} className="rounded" data-ai-hint="product"/>
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center bg-secondary rounded">
                            {type === 'Category' && <Boxes className="h-5 w-5 text-muted-foreground" />}
                            {type === 'Brand' && <Tag className="h-5 w-5 text-muted-foreground" />}
                            {type === 'Supplier' && <Building className="h-5 w-5 text-muted-foreground" />}
                            {type === 'Attribute' && <ChevronsRight className="h-5 w-5 text-muted-foreground" />}
                          </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate font-medium">{result.name}</p>
                          {result.context && <p className="text-xs text-muted-foreground truncate">in {result.context}</p>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Separator className="my-1 last-of-type:hidden" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">No results found for "{searchTerm}"</div>
        )}
      </ScrollArea>
      <div className="p-2 border-t text-center">
        <Button variant="link" size="sm" asChild>
          <Link href={`/products?q=${encodeURIComponent(searchTerm)}`} onClick={handleResultClick}>View all results</Link>
        </Button>
      </div>
    </div>
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
            <button onClick={handleLogout} className="flex items-center gap-1 hover:text-primary text-xs">
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
        <Link href="/sign-in" className="flex items-center gap-1 hover:text-primary">
            <User className="h-4 w-4" />
            Login
        </Link>
    )
  }

  if (isMobile) {
    return (
       <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm" ref={searchWrapperRef}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
              <div className="bg-primary p-4">
                <Link href="/" className="flex items-center gap-2">
                  <Image src="https://placehold.co/40x40/FFFFFF/8B2BE2.png" alt="eMotionView Logo" width={40} height={40} data-ai-hint="logo initial"/>
                  <span className="font-bold text-xl text-primary-foreground">eMotionView</span>
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
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold font-headline text-xl text-foreground">eMotionView</span>
          </Link>
          <CartButton />
        </div>
        <div className="px-4 py-3 border-b relative">
          <form>
            <div className="relative">
              {searchInput}
              {searchButton}
            </div>
          </form>
          {isSearchFocused && searchTerm.length >= 3 && 
            <div className="absolute top-full left-0 right-0 px-4 pb-4 bg-background">
              {searchResultsPanel}
            </div>
          }
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm" ref={searchWrapperRef}>
      {/* Top Bar (hides on scroll) */}
      <div className={cn("bg-secondary/50 text-black transition-all duration-300", isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-8')}>
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
             <AccountLinks />
             <span className="text-muted-foreground">|</span>
             <Link href="/track-order" className="flex items-center gap-1 hover:text-primary">
                <MapPin className="h-4 w-4" />
                Order Track
            </Link>
          </div>
        </div>
      </div>
      
      {/* Normal Header (Unscrolled) */}
      <div className={cn("border-b", isScrolled ? 'hidden' : 'block')}>
        <div className="container mx-auto h-20 items-center justify-between gap-4 px-4 flex">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="https://placehold.co/50x50/FFFFFF/000000.png" alt="eMotionView Logo" width={40} height={40} data-ai-hint="logo globe"/>
            <span className="font-bold font-headline text-2xl text-foreground">eMotionView</span>
          </Link>
          <div className="flex flex-1 justify-center px-8 relative">
            <form className="w-full max-w-2xl">
              <div className="relative">
                {searchInput}
                {searchButton}
              </div>
            </form>
            {isSearchFocused && searchTerm.length >= 3 && searchResultsPanel}
          </div>
          <div className="flex items-center justify-end">
            <CartButton />
          </div>
        </div>
      </div>

      {/* Sticky Header (Scrolled) */}
      <div className={cn("border-b shadow-md", isScrolled ? 'block' : 'hidden')}>
        <div className="container mx-auto h-16 items-center justify-between gap-4 px-4 flex">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <Image src="https://placehold.co/50x50/FFFFFF/000000.png" alt="eMotionView Logo" width={32} height={32} data-ai-hint="logo globe"/>
                <span className="font-bold font-headline text-xl text-foreground">eMotionView</span>
            </Link>

            <div className="hidden lg:flex">
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

            <div className="flex-1 flex justify-center px-4 relative">
                 <form className="w-full max-w-lg">
                    <div className="relative">
                      {searchInput}
                      {searchButton}
                    </div>
                </form>
                {isSearchFocused && searchTerm.length >= 3 && searchResultsPanel}
            </div>

            <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/wishlist">
                        <Heart className="h-6 w-6" />
                        <span className="sr-only">Wishlist</span>
                    </Link>
                </Button>
                <CartButton />
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
    </header>
  )
}

    