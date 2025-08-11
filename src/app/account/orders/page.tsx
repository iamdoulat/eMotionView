
"use client";

import { type Order } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, docToJSON } from "@/lib/firebase";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const { user, isLoading: isAuthLoading } = useAuth();
    const [isOrdersLoading, setIsOrdersLoading] = useState(true);

    useEffect(() => {
        if (isAuthLoading) return;
        
        if (!user) {
            setIsOrdersLoading(false);
            return;
        };

        const fetchOrders = async () => {
            if (!user?.uid) return;
            setIsOrdersLoading(true);
            try {
                const ordersQuery = query(
                    collection(db, 'orders'),
                    where('userId', '==', user.uid),
                    orderBy('date', 'desc')
                );
                const querySnapshot = await getDocs(ordersQuery);
                const userOrders = querySnapshot.docs.map(doc => docToJSON(doc) as Order);
                setOrders(userOrders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setIsOrdersLoading(false);
            }
        };

        fetchOrders();
    }, [user, isAuthLoading]);

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
    
    const isLoading = isAuthLoading || isOrdersLoading;

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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : orders.length > 0 ? (
                            orders.map((order) => (
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
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    You have not placed any orders yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
