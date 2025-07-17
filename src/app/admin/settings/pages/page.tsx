
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List, ListItem } from "@/components/ui/list";
import { FileText, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <CardDescription>Select a page to manage its content. Click the arrow to edit, or the external link icon to view the live page.</CardDescription>
      </CardHeader>
      <CardContent>
        <List>
            {staticPages.map(page => (
                <ListItem key={page.slug} className="flex items-center justify-between p-0">
                    <Link href={`/admin/settings/pages/${page.slug}`} className="flex-1 p-4 flex items-center gap-4">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <span className="font-medium">{page.title}</span>
                            <p className="text-sm text-muted-foreground">/{page.slug}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                     <Button asChild variant="ghost" size="icon" className="mr-2">
                        <Link href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${page.title} page`}>
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </Button>
                </ListItem>
            ))}
        </List>
      </CardContent>
    </Card>
  );
}
