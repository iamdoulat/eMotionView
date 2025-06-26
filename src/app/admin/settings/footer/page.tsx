
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const companyLinks = [
    { label: "Privacy Policy" },
    { label: "Terms and conditions" },
    { label: "Return and Refund Policy" },
    { label: "EMI" },
    { label: "Warranty" },
    { label: "Delivery Policy" },
    { label: "Support Center" },
    { label: "Contact Us" },
];

export default function FooterSettingsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Footer Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>About Section</CardTitle>
                    <CardDescription>Manage the main description and app store links in the footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="footer-description">Store Description</Label>
                        <Textarea id="footer-description" defaultValue="Motion View is the largest Eco Product importer and Distributor in Bangladesh and now holds the leading position in the ecosystem industry." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="app-store-link">App Store Link</Label>
                            <Input id="app-store-link" placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="google-play-link">Google Play Link</Label>
                            <Input id="google-play-link" placeholder="https://..." />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Update your physical address, phone, and email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="footer-address">Address</Label>
                        <Textarea id="footer-address" defaultValue="10/25 (9th Commercial Floor), Eastern Plaza, 70 Bir Uttam C.R Datta Road, Hatirpool, Dhaka-1205" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="footer-phone">Phone Number</Label>
                            <Input id="footer-phone" defaultValue="09677460460" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footer-email">Email</Label>
                            <Input id="footer-email" type="email" defaultValue="motionview22@gmail.com.bd" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Enter the full URLs for your social media profiles.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="social-facebook" className="flex items-center gap-2 w-32"><Facebook /> Facebook</Label>
                        <Input id="social-facebook" placeholder="https://facebook.com/your-page" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Label htmlFor="social-twitter" className="flex items-center gap-2 w-32"><Twitter /> Twitter</Label>
                        <Input id="social-twitter" placeholder="https://twitter.com/your-handle" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Label htmlFor="social-instagram" className="flex items-center gap-2 w-32"><Instagram /> Instagram</Label>
                        <Input id="social-instagram" placeholder="https://instagram.com/your-profile" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Label htmlFor="social-linkedin" className="flex items-center gap-2 w-32"><Linkedin /> LinkedIn</Label>
                        <Input id="social-linkedin" placeholder="https://linkedin.com/company/your-company" />
                    </div>
                     <div className="flex items-center gap-4">
                        <Label htmlFor="social-youtube" className="flex items-center gap-2 w-32"><Youtube /> YouTube</Label>
                        <Input id="social-youtube" placeholder="https://youtube.com/your-channel" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Company Links</CardTitle>
                    <CardDescription>Manage the links under the "Company" section in the footer.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {companyLinks.map(link => (
                        <div key={link.label} className="space-y-2">
                            <Label htmlFor={`link-${link.label.toLowerCase().replace(/ /g, '-')}`}>{link.label}</Label>
                            <Input id={`link-${link.label.toLowerCase().replace(/ /g, '-')}`} placeholder="/your-link" />
                        </div>
                    ))}
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button size="lg">Save All Footer Changes</Button>
            </div>
        </div>
    );
}
