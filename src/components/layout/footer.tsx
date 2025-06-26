import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Youtube, Send } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-lg text-primary">eMotionView</h4>
            <p className="text-muted-foreground text-sm">
              Your one-stop shop for the latest tech gadgets. We provide AI-powered recommendations to help you find the perfect product.
            </p>
             <div className="flex space-x-4 pt-2">
              <Link href="#"><Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
              <Link href="#"><Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
              <Link href="#"><Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
              <Link href="#"><Youtube className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Blogs</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-lg">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-lg">Stay Connected</h4>
            <p className="text-muted-foreground text-sm">Subscribe for the latest deals and offers.</p>
            <form className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Your Email" className="bg-secondary/50" />
              <Button type="submit" size="icon"><Send className="h-4 w-4"/></Button>
            </form>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} eMotionView. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
