"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Download } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Order } from '@/lib/placeholder-data';

export default function PaymentsPage() {
    const router = useRouter();
    const { user, role, isLoading: isAuthLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isAuthLoading) return;

        if (!user || !role || !['Admin', 'Manager', 'Staff'].includes(role)) {
            router.push('/');
            return;
        }

        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, orderBy('date', 'desc'));
                const querySnapshot = await getDocs(q);

                const ordersData: Order[] = [];
                querySnapshot.forEach((doc) => {
                    ordersData.push({ id: doc.id, ...doc.data() } as Order);
                });

                // Filter orders that have payment information
                const ordersWithPayments = ordersData.filter(order => order.paymentMethod);
                setOrders(ordersWithPayments);
                setFilteredOrders(ordersWithPayments);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [user, role, isAuthLoading, router]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredOrders(orders);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = orders.filter(
            (order) =>
                order.orderNumber.toLowerCase().includes(query) ||
                order.customerName.toLowerCase().includes(query) ||
                order.paymentDetails?.bkash?.trxID?.toLowerCase().includes(query) ||
                order.paymentDetails?.bkash?.paymentID?.toLowerCase().includes(query)
        );
        setFilteredOrders(filtered);
    }, [searchQuery, orders]);

    const getPaymentStatusBadge = (status?: string) => {
        switch (status) {
            case 'completed':
                return <Badge variant="default">Completed</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'refunded':
                return <Badge variant="outline">Refunded</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getPaymentMethodBadge = (method?: string) => {
        switch (method) {
            case 'bkash':
                return <Badge className="bg-pink-600 hover:bg-pink-700">Bkash</Badge>;
            case 'card':
                return <Badge variant="secondary">Card</Badge>;
            default:
                return <Badge variant="outline">N/A</Badge>;
        }
    };

    const exportToCSV = () => {
        const headers = ['Order Number', 'Customer', 'Payment Method', 'Amount', 'Status', 'Transaction ID', 'Date'];
        const csvData = filteredOrders.map(order => [
            order.orderNumber,
            order.customerName,
            order.paymentMethod || 'N/A',
            order.total.toFixed(2),
            order.paymentStatus || 'N/A',
            order.paymentDetails?.bkash?.trxID || 'N/A',
            new Date(order.date).toLocaleDateString(),
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (isLoading || isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Payment Transactions</h1>
                    <p className="text-muted-foreground mt-2">
                        View and manage all payment transactions
                    </p>
                </div>
                <Button onClick={exportToCSV} disabled={filteredOrders.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by order number, customer, or transaction ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <CardDescription>
                        Total transactions: {filteredOrders.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Number</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                                        No payment transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell>{getPaymentMethodBadge(order.paymentMethod)}</TableCell>
                                        <TableCell>${order.total.toFixed(2)}</TableCell>
                                        <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {order.paymentDetails?.bkash?.trxID || 'N/A'}
                                        </TableCell>
                                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/admin/payments/${order.id}`)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
