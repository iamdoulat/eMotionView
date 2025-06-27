
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GeneralSettingsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Store Details</CardTitle>
                    <CardDescription>Manage your store's basic information, currency, and language.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="store-name">Store Name</Label>
                        <Input id="store-name" defaultValue="eMotionView" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="store-currency">Store Currency</Label>
                            <Select defaultValue="usd">
                                <SelectTrigger id="store-currency">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="usd">USD ($)</SelectItem>
                                    <SelectItem value="bdt">BDT (৳)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="store-language">Language</Label>
                            <Select defaultValue="en">
                                <SelectTrigger id="store-language">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="bn">Bengali</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Store Details</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Login & Registration</CardTitle>
                    <CardDescription>Configure how users sign up and log in to your store.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="font-medium">Login/Registration with</Label>
                        <RadioGroup defaultValue="email-phone" className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="email" id="login-email" />
                                <Label htmlFor="login-email" className="font-normal">Email</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="phone" id="login-phone" />
                                <Label htmlFor="login-phone" className="font-normal">Phone</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="email-phone" id="login-email-phone" />
                                <Label htmlFor="login-email-phone" className="font-normal">Email & Phone</Label>
                            </div>
                        </RadioGroup>
                    </div>
                     <div>
                        <Label className="font-medium">OTP Verification</Label>
                        <p className="text-sm text-muted-foreground mb-2">If disabled, customers can register and login without verification.</p>
                        <RadioGroup defaultValue="phone" className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="email" id="otp-email" />
                                <Label htmlFor="otp-email" className="font-normal">Verify with Email</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="phone" id="otp-phone" />
                                <Label htmlFor="otp-phone" className="font-normal">Verify with Phone</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="disabled" id="otp-disabled" />
                                <Label htmlFor="otp-disabled" className="font-normal">Disabled</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Login Settings</Button>
                </CardFooter>
            </Card>

            <div className="flex justify-end">
                <Button size="lg">Save All General Settings</Button>
            </div>
        </div>
    )
}
