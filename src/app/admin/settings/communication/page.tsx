
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, MessageSquareText, Bot } from "lucide-react";

export default function CommunicationSettingsPage() {
    const emailNotifications = [
        { id: "email-order-confirmation", label: "Order Confirmation", description: "Sent to customers after they place an order." },
        { id: "email-shipping-update", label: "Shipping Update", description: "Sent when an order's shipping status changes." },
        { id: "email-delivery-confirmation", label: "Delivery Confirmation", description: "Sent after an order has been successfully delivered." },
        { id: "email-password-reset", label: "Password Reset", description: "Sent when a customer requests to reset their password." },
    ];

    const smsNotifications = [
        { id: "sms-order-confirmation", label: "Order Confirmation" },
        { id: "sms-shipping-update", label: "Shipping Update" },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Communication Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Mail /> Email Notifications</CardTitle>
                    <CardDescription>Manage the automated emails sent from your store.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="sender-email">Sender Email Address</Label>
                        <Input id="sender-email" type="email" placeholder="noreply@emotionview.com" />
                    </div>
                    <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-medium mb-4">Customer Emails</h3>
                         {emailNotifications.map(notification => (
                            <div key={notification.id} className="flex flex-row items-start justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor={notification.id} className="text-base">{notification.label}</Label>
                                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                                </div>
                                <Switch id={notification.id} defaultChecked />
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Email Settings</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquareText /> SMS Notifications</CardTitle>
                    <CardDescription>Configure your SMS provider and manage automated text messages. (Requires a third-party SMS service like Twilio).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sms-sid">Account SID</Label>
                            <Input id="sms-sid" placeholder="Your SMS Provider Account SID" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sms-token">Auth Token</Label>
                            <Input id="sms-token" type="password" placeholder="Your SMS Provider Auth Token" />
                        </div>
                    </div>
                    <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-medium mb-4">Customer SMS Alerts</h3>
                         {smsNotifications.map(notification => (
                            <div key={notification.id} className="flex flex-row items-center justify-between">
                                <Label htmlFor={notification.id} className="text-base">{notification.label}</Label>
                                <Switch id={notification.id} />
                            </div>
                        ))}
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button>Save SMS Settings</Button>
                </CardFooter>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot /> Customer Support Method</CardTitle>
                    <CardDescription>Choose how customers can contact you for support.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup defaultValue="contact-form" className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="contact-form" id="contact-form" />
                            <Label htmlFor="contact-form">Standard Contact Form</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ai-chatbot" id="ai-chatbot" />
                            <Label htmlFor="ai-chatbot">AI-Powered Chatbot</Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

             <div className="flex justify-end">
                <Button size="lg">Save All Communication Changes</Button>
            </div>

        </div>
    );
}
