
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, PackageSearch } from "lucide-react";
import { orders, type Order } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  orderNumber: z.string().min(1, { message: "Order number is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function TrackOrderPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderNumber: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setFoundOrder(null);

    // Simulate API call to find the order
    setTimeout(() => {
      const order = orders.find(o => o.orderNumber === values.orderNumber);
      if (order) {
        setFoundOrder(order);
      } else {
        setError("No order found with that number and email combination.");
      }
      setIsLoading(false);
    }, 1000);
  }
  
  const getStatusProgress = (status: Order['status']) => {
    if (status === 'Cancelled') return 0;
    const currentIndex = statusSteps.indexOf(status);
    return ((currentIndex + 1) / statusSteps.length) * 100;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <PackageSearch className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-3xl">Track Your Order</CardTitle>
            <CardDescription>Enter your order number and email to see its status.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., USA-123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Track Order
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {error && (
            <div className="mt-6 text-center text-destructive">{error}</div>
        )}

        {foundOrder && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Order #{foundOrder.orderNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={foundOrder.status === 'Delivered' ? 'default' : foundOrder.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                        {foundOrder.status}
                    </Badge>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Order Date</span>
                    <span className="font-medium">{new Date(foundOrder.date).toLocaleDateString()}</span>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-4">Progress</h4>
                   {foundOrder.status !== 'Cancelled' ? (
                      <>
                        <Progress value={getStatusProgress(foundOrder.status)} className="w-full" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          {statusSteps.map(step => <span key={step}>{step}</span>)}
                        </div>
                      </>
                   ) : (
                    <p className="text-center text-destructive-foreground bg-destructive/80 p-3 rounded-md">This order has been cancelled.</p>
                   )}
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
