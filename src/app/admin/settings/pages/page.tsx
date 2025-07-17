
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List, ListItem } from "@/components/ui/list";
import { FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

const staticPages = [
    { slug: 'privacy-policy', title: 'Privacy Policy' },
    { slug: 'terms-and-conditions', title: 'Terms and conditions' },
    { slug: 'return-and-refund-policy', title: 'Return and Refund Policy' },
    { slug: 'emi', title: 'EMI' },
    { slug: 'warranty', title: 'Warranty' },
    { slug: 'delivery-policy', title: 'Delivery Policy' },
    { slug: 'support-center', title: 'Support Center' },
    { slug: 'contact-us', title: 'Contact Us' },
];

export default function PagesSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Pages</CardTitle>
        <CardDescription>Select a page to manage its content.</CardDescription>
      </CardHeader>
      <CardContent>
        <List>
            {staticPages.map(page => (
                <ListItem key={page.slug} asChild>
                    <Link href={`/admin/settings/pages/${page.slug}`}>
                        <div className="flex items-center gap-4">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span className="flex-1 font-medium">{page.title}</span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </Link>
                </ListItem>
            ))}
        </List>
      </CardContent>
    </Card>
  );
}
