import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db, docToJSON } from "@/lib/firebase";
import type { Category } from "@/lib/placeholder-data";


export async function CategoryMenu() {
    let categories: Category[] = [];
    try {
        const categoriesSnapshot = await getDocs(query(collection(db, 'categories'), limit(11)));
        categories = categoriesSnapshot.docs.map(docToJSON) as Category[];
    } catch (error) {
        console.warn("Could not load categories for menu.", error);
    }
    
    return (
        <Card className="h-full">
            <div className="px-3 pt-2 pb-3 border-b">
                 <Button className="w-full justify-start font-bold text-base bg-primary hover:bg-primary/90">
                    <LayoutGrid className="mr-3 h-5 w-5" />
                    All Categories
                </Button>
            </div>
            <nav className="p-2">
                <ul className="space-y-1">
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <Link 
                                href={`/category/${cat.permalink}`} 
                                className="flex items-center justify-between p-2 text-sm font-medium text-foreground rounded-md transition-colors hover:bg-secondary group"
                            >
                                <span>{cat.name}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </Card>
    )
}
