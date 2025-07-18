
"use client";

import { orders as initialOrders, type Order } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const storedOrders: Order[] = JSON.parse(localStorage.getItem('newOrders') || '[]');
        const combinedOrders = [...initialOrders];
        
        // Add new orders from storage, avoiding duplicates
        storedOrders.forEach(storedOrder => {
            if (!combinedOrders.some(o => o.id === storedOrder.id)) {
                combinedOrders.push(storedOrder);
            }
        });
        
        // Sort all orders by date, most recent first
        combinedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(combinedOrders);
    }, []);

    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'Delivered':
                return 'default';
            case 'Processing':
            case 'Shipped':
                return 'secondary';
            case 'Pending':
                 return 'secondary';
            case 'Cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    }

  return (
    <div>
        <h1 className="font-headline text-3xl font-bold text-foreground mb-6">My Orders</h1>
        <Card>
            <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your past orders and their status.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">View</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(order.status)}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/account/orders/${order.id}`}>
                                            <ArrowRight className="h-4 w-4"/>
                                            <span className="sr-only">View Order</span>
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
