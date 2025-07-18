
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { orders as initialOrders, type Order } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Search, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

type StatusFilter = "all" | Order['status'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Function to load and combine orders
    const loadOrders = () => {
        const storedOrders: Order[] = JSON.parse(localStorage.getItem('newOrders') || '[]');
        const combinedOrders = [...initialOrders];
        
        // Add new orders from storage, avoiding duplicates
        storedOrders.forEach(storedOrder => {
            if (!combinedOrders.some(o => o.id === storedOrder.id)) {
                combinedOrders.push(storedOrder);
            }
        });
        setOrders(combinedOrders);
    };

    loadOrders();
    // Also listen for storage events to update orders in real-time from other tabs
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => filter === 'all' || order.status === filter)
      .filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, filter, searchTerm]);

  const handleSaveChanges = () => {
    if (!orderToEdit) return;
    
    // Update state
    const updatedOrdersState = orders.map(o => o.id === orderToEdit.id ? orderToEdit : o);
    setOrders(updatedOrdersState);

    // Update local storage for orders that came from it
    const storedOrders: Order[] = JSON.parse(localStorage.getItem('newOrders') || '[]');
    const isStoredOrder = storedOrders.some(o => o.id === orderToEdit.id);

    if (isStoredOrder) {
        const newStoredOrders = storedOrders.map(o => o.id === orderToEdit.id ? orderToEdit : o);
        localStorage.setItem('newOrders', JSON.stringify(newStoredOrders));
    } else {
        // This is a more complex case - if we edit a non-stored (initial) order,
        // we might want to add it to local storage to persist the change.
        // For simplicity, we'll just add it to newOrders to persist changes.
        const otherStoredOrders = storedOrders.filter(o => o.id !== orderToEdit.id);
        localStorage.setItem('newOrders', JSON.stringify([...otherStoredOrders, orderToEdit]));
    }

    setOrderToEdit(null);
  };
  
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Pending':
      case 'Shipped':
      case 'Processing':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage your customer orders here.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by Order # or Customer..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as StatusFilter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Processing">Processing</TabsTrigger>
              <TabsTrigger value="Shipped">Shipped</TabsTrigger>
              <TabsTrigger value="Delivered">Delivered</TabsTrigger>
              <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="border rounded-md mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={order.customerAvatar} alt={order.customerName} data-ai-hint="person face" />
                          <AvatarFallback>{order.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span>{order.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(order.date), "PPP")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/account/orders/${order.id}`}><FileText className="mr-2 h-4 w-4" />View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setOrderToEdit(order)}>
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No results found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!orderToEdit} onOpenChange={(open) => !open && setOrderToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <p className="text-sm text-muted-foreground">Order #{orderToEdit?.orderNumber}</p>
          </DialogHeader>
          {orderToEdit && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select
                  value={orderToEdit.status}
                  onValueChange={(value: Order['status']) => setOrderToEdit({ ...orderToEdit, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOrderToEdit(null)}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
