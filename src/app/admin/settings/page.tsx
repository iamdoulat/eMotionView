import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
       <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>Manage your store's basic information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store Name</Label>
            <Input id="store-name" defaultValue="eMotionView" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-email">Contact Email</Label>
            <Input id="store-email" type="email" defaultValue="contact@emotionview.com" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Store Info</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payments & Shipping</CardTitle>
          <CardDescription>Manage payment gateways, shipping zones, and tax rules.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Configure how you get paid and how you ship your products to customers.
            </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/admin/settings/payments">
                Configure Settings
                <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Customization</CardTitle>
          <CardDescription>Customize the layout and content of your homepage.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Control the hero banner, featured sections, and more to create a unique look for your store.
            </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/admin/settings/homepage">
                Customize Homepage
                <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer Settings</CardTitle>
          <CardDescription>Manage the content and links in your website footer.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Update contact information, social media links, and other footer elements.
            </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/admin/settings/footer">
                Edit Footer
                <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
