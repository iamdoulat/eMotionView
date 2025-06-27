
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, MessageSquareText, Bot, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type OtpGateway = "twilio" | "vonage" | "whatsapp";

export default function CommunicationSettingsPage() {
    const [activeGateway, setActiveGateway] = useState<OtpGateway>("twilio");
    const { toast } = useToast();

    const handleSendTestEmail = () => {
        // In a real app, this would trigger a server action to send the email.
        // For now, we just simulate it and show a toast.
        toast({
            title: "Test Email Sent",
            description: "A test email has been sent to the specified address.",
        });
    };

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
        <Dialog>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold tracking-tight">Communication Settings</h1>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Send /> SMTP Settings</CardTitle>
                        <CardDescription>Configure your external SMTP service for sending emails. For Gmail, use Port 465 for SSL, or 587 for TLS.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="smtp-host">SMTP Host</Label>
                                <Input id="smtp-host" placeholder="smtp.gmail.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="smtp-port">SMTP Port</Label>
                                <Input id="smtp-port" placeholder="587" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="smtp-user">Username</Label>
                                <Input id="smtp-user" type="email" placeholder="example@gmail.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="smtp-pass">Password</Label>
                                <Input id="smtp-pass" type="password" placeholder="Your Gmail password or App Password" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp-encryption">Encryption</Label>
                            <Select defaultValue="tls">
                                <SelectTrigger id="smtp-encryption">
                                    <SelectValue placeholder="Select encryption" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="ssl">SSL</SelectItem>
                                    <SelectItem value="tls">TLS/STARTTLS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                        <Button>Save SMTP Settings</Button>
                        <DialogTrigger asChild>
                           <Button variant="outline">Send a Test Email</Button>
                        </DialogTrigger>
                    </CardFooter>
                </Card>

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
                        <CardTitle className="flex items-center gap-2"><MessageSquareText /> SMS & OTP Gateway</CardTitle>
                        <CardDescription>Configure your SMS/OTP provider and manage automated text messages.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeGateway} onValueChange={(value) => setActiveGateway(value as OtpGateway)}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="twilio">Twilio</TabsTrigger>
                                <TabsTrigger value="vonage">Vonage</TabsTrigger>
                                <TabsTrigger value="whatsapp">WhatsApp OTP</TabsTrigger>
                            </TabsList>
                            <TabsContent value="twilio" className="mt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="twilio-sid">Account SID</Label>
                                    <Input id="twilio-sid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="twilio-token">Auth Token</Label>
                                    <Input id="twilio-token" type="password" placeholder="••••••••" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="twilio-number">Twilio Phone Number</Label>
                                    <Input id="twilio-number" placeholder="+15005550006" />
                                </div>
                            </TabsContent>
                            <TabsContent value="vonage" className="mt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vonage-key">API Key</Label>
                                    <Input id="vonage-key" placeholder="Your Vonage API Key" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vonage-secret">API Secret</Label>
                                    <Input id="vonage-secret" type="password" placeholder="••••••••" />
                                </div>
                            </TabsContent>
                            <TabsContent value="whatsapp" className="mt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="wa-id">Phone Number ID</Label>
                                    <Input id="wa-id" placeholder="Your WhatsApp Business Phone Number ID" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="wa-token">Access Token</Label>
                                    <Input id="wa-token" type="password" placeholder="••••••••" />
                                </div>
                            </TabsContent>
                        </Tabs>
                        <div className="space-y-4 rounded-md border p-4 mt-6">
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
                        <Button>Save Gateway Settings</Button>
                    </CardFooter>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot /> Customer Support</CardTitle>
                        <CardDescription>Choose how customers can contact you for support and manage chat.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup defaultValue="contact-form" className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="contact-form" id="contact-form" />
                                <Label htmlFor="contact-form">Standard Contact Form</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ai-chatbot" id="ai-chatbot" />
                                <Label htmlFor="ai-chatbot">AI-Powered Chatbot</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="live-chat" id="live-chat" />
                                <Label htmlFor="live-chat">Live Chat Support</Label>
                            </div>
                        </RadioGroup>
                        <div className="p-4 border rounded-md flex items-center justify-between">
                            <p className="text-sm font-medium">Open the live chat panel to manage conversations.</p>
                            <Button asChild><Link href="/admin/chat">Open Chat</Link></Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg">Save All Communication Changes</Button>
                </div>

            </div>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send a test email</DialogTitle>
                    <DialogDescription>
                        Enter an email address to send a test message to. This will use your saved SMTP settings.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="test-email">Recipient Email</Label>
                    <Input id="test-email" type="email" placeholder="recipient@example.com" />
                </div>
                <DialogFooter>
                    <DialogTrigger asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                        <Button onClick={handleSendTestEmail}>Send Email</Button>
                    </DialogTrigger>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
