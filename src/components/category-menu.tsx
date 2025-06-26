import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

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
];

export function CategoryMenu() {
    return (
        <Card className="h-full">
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
