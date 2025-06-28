
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Percent, PlusCircle, Trash2 } from "lucide-react";

export default function PaymentShippingSettingsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Payment & Shipping</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Enable and configure the payment gateways for your store.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                            <Label htmlFor="stripe-payment" className="text-base font-medium">Stripe</Label>
                            <p className="text-sm text-muted-foreground">Accept credit cards, debit cards, and more.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline">Configure</Button>
                            <Switch id="stripe-payment" defaultChecked />
                        </div>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                            <Label htmlFor="paypal-payment" className="text-base font-medium">PayPal</Label>
                            <p className="text-sm text-muted-foreground">Allow customers to pay with their PayPal account.</p>
                        </div>
                         <div className="flex items-center gap-4">
                            <Button variant="outline">Configure</Button>
                            <Switch id="paypal-payment" />
                        </div>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                            <Label htmlFor="cod-payment" className="text-base font-medium">Cash on Delivery (COD)</Label>
                            <p className="text-sm text-muted-foreground">Accept cash payments upon delivery.</p>
                        </div>
                         <div className="flex items-center gap-4">
                            <Button variant="outline" disabled>Configure</Button>
                            <Switch id="cod-payment" defaultChecked />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Shipping Zones & Rates</CardTitle>
                            <CardDescription>Define where you ship and how much you charge.</CardDescription>
                        </div>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Shipping Zone
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Zone Name</TableHead>
                                <TableHead>Regions</TableHead>
                                <TableHead>Shipping Method</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Domestic</TableCell>
                                <TableCell>United States</TableCell>
                                <TableCell>Standard Shipping</TableCell>
                                <TableCell className="text-right">$5.00</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">International</TableCell>
                                <TableCell>Rest of World</TableCell>
                                <TableCell>International Priority</TableCell>
                                <TableCell className="text-right">$25.00</TableCell>
                                 <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tax Settings</CardTitle>
                    <CardDescription>Configure how taxes are calculated at checkout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center space-x-2">
                        <Switch id="tax-enabled" />
                        <Label htmlFor="tax-enabled">Enable automated tax calculations</Label>
                    </div>
                    <div className="space-y-2">
                        <Label>Default Tax Rate</Label>
                        <div className="relative">
                            <Input type="number" placeholder="e.g., 8.5" />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                         <p className="text-sm text-muted-foreground">This rate will be used if no specific regional rates apply.</p>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button>Save Tax Settings</Button>
                </CardFooter>
            </Card>

            <div className="flex justify-end">
                <Button size="lg">Save All Settings</Button>
            </div>
        </div>
    );
}
