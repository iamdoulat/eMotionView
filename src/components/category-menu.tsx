import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

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
];

export function CategoryMenu() {
    return (
        <Card className="h-full mt-[2px]">
            <div className="px-3 pt-2 pb-3 border-b">
                 <Button className="w-full justify-start font-bold text-base bg-primary hover:bg-primary/90">
                    <LayoutGrid className="mr-3 h-5 w-5" />
                    All Categories
                </Button>
            </div>
            <nav className="p-2">
                <ul className="space-y-1">
                    {categoryLinks.map((link) => (
                        <li key={link.name}>
                            <Link 
                                href={link.href} 
                                className="flex items-center justify-between p-2 text-sm font-medium text-foreground rounded-md transition-colors hover:bg-secondary group"
                            >
                                <span>{link.name}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </Card>
    )
}
