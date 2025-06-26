import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Homepage Design</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Hero Banner</CardTitle>
          <CardDescription>Update the main banner at the top of your homepage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-image">Banner Image</Label>
            <Input id="hero-image" type="file" />
            <p className="text-sm text-muted-foreground">Recommended size: 900x440px</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-headline">Headline</Label>
            <Input id="hero-headline" defaultValue="GADGET FEST" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-subheadline">Sub-headline</Label>
            <Textarea id="hero-subheadline" defaultValue="Up to 60% off on your favorite gadgets." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-button-text">Button Text</Label>
            <Input id="hero-button-text" defaultValue="Shop Now" />
          </div>
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
