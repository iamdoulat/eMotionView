import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collection, getDocs, limit, query, docToJSON } from "@/lib/db";
import type { Category } from "@/lib/placeholder-data";


export async function CategoryMenu() {
    let categories: Category[] = [];
    try {
        const categoriesSnapshot = await getDocs(query(collection('categories'), limit(25)));
        const allCats = categoriesSnapshot.docs.map(docToJSON) as Category[];
        categories = allCats
            .filter(cat => cat.showInMenu !== false)
            .sort((a, b) => {
                const orderA = a.order ?? 0;
                const orderB = b.order ?? 0;
                if (orderA !== orderB) return orderA - orderB;
                return (a.name || '').localeCompare(b.name || '');
            });
    } catch (error) {
        console.warn("Could not load categories for menu.", error);
    }
    
    return (
        <Card className="rounded-xl border border-border/70 shadow-xs overflow-hidden">
            <div className="p-2 border-b bg-primary/5">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm sm:text-base">
                    <LayoutGrid className="h-4 w-4 shrink-0" />
                    <span>All Categories</span>
                </div>
            </div>
            <nav className="p-2">
                <ul className="space-y-1">
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <Link 
                                href={`/category/${cat.permalink}`} 
                                className="flex items-center justify-between px-3 py-2 text-sm sm:text-[15px] font-medium text-foreground/90 rounded-md transition-all hover:bg-secondary hover:text-primary group"
                            >
                                <span className="truncate">{cat.name}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary shrink-0" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </Card>
    )
}
