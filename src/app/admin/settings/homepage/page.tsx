import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Move } from "lucide-react";

export default function HomepageSettingsPage() {
  const sections = [
    "Featured Categories",
    "New Arrivals",
    "Promotional Banners",
    "Popular Products",
    "Smart Watches",
    "Headphones",
  ];

  const heroBanners = Array.from({ length: 5 });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Homepage Design</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Hero Banners</CardTitle>
          <CardDescription>Manage the rotating banners at the top of your homepage. Configure up to 5.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            {heroBanners.map((_, index) => (
              <AccordionItem value={`item-${index + 1}`} key={index}>
                <AccordionTrigger>Hero Banner {index + 1}</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`hero-image-${index + 1}`}>Banner Image</Label>
                        <Input id={`hero-image-${index + 1}`} type="file" />
                        <p className="text-sm text-muted-foreground">Recommended size: 900x440px</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-headline-${index + 1}`}>Headline</Label>
                        <Input id={`hero-headline-${index + 1}`} placeholder="e.g. GADGET FEST" defaultValue={index === 0 ? "GADGET FEST" : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-subheadline-${index + 1}`}>Sub-headline</Label>
                        <Textarea id={`hero-subheadline-${index + 1}`} placeholder="e.g. Up to 60% off..." defaultValue={index === 0 ? "Up to 60% off on your favorite gadgets." : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hero-button-text-${index + 1}`}>Button Text</Label>
                        <Input id={`hero-button-text-${index + 1}`} placeholder="e.g. Shop Now" defaultValue={index === 0 ? "Shop Now" : ""} />
                      </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Sections</CardTitle>
          <CardDescription>Drag and drop to reorder the sections on your homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section} className="flex items-center justify-between rounded-md border bg-background p-3">
                <div className="flex items-center gap-3">
                    <Move className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <p className="font-medium">{section}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
          <Button size="lg">Save Changes</Button>
      </div>
    </div>
  );
}
