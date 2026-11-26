"use client";

import { useState, useEffect, useMemo } from "react";
import { CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrency } from "@/hooks/use-currency";
import type { Order, Product } from "@/lib/placeholder-data";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminAnalyticsPage() {
  const { formatPrice, symbol } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/data/orders').then(r => (r.ok ? r.json() : [])),
      fetch('/api/data/products').then(r => (r.ok ? r.json() : [])),
      fetch('/api/data/customers').then(r => (r.ok ? r.json() : [])),
      fetch('/api/data/analytics').then(r => (r.ok ? r.json() : [])),
    ])
      .then(([ordersData, productsData, customersData, analyticsData]) => {
        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(productsData)) setProducts(productsData);
        if (Array.isArray(customersData)) setCustomersCount(customersData.length);
        if (Array.isArray(analyticsData)) {
          const sumVisits = analyticsData.reduce((sum: number, d: any) => sum + (Number(d.count) || 0), 0);
          setTotalVisitors(sumVisits);
        }
      })
      .catch(() => {});
  }, []);

  const validOrders = useMemo(() => orders.filter(o => o.status !== 'Cancelled'), [orders]);
  const totalRevenue = useMemo(() => validOrders.reduce((s, o) => s + (Number(o.total) || 0), 0), [validOrders]);
  const conversionRate = totalVisitors > 0 ? ((validOrders.length / totalVisitors) * 100).toFixed(1) : '0.0';

  const salesData = useMemo(() => {
    const monthly = MONTH_NAMES.map(name => ({ name, sales: 0, revenue: 0 }));
    for (const order of validOrders) {
      const m = new Date(order.date).getMonth();
      if (!Number.isNaN(m) && monthly[m]) {
        monthly[m].sales += 1;
        monthly[m].revenue += Number(order.total) || 0;
      }
    }
    return monthly;
  }, [validOrders]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const order of validOrders) {
      for (const item of order.items || []) {
        const prod = products.find(p => p.id === item.productId || (p as any)._id === item.productId);
        const cat = prod?.categories?.[0] || 'Other';
        counts[cat] = (counts[cat] || 0) + (item.quantity || 1);
      }
    }
    const entries = Object.entries(counts).map(([name, value]) => ({ name, value }));
    if (entries.length > 0) return entries;

    const prodCounts: Record<string, number> = {};
    for (const p of products) {
      const cat = p.categories?.[0] || 'Other';
      prodCounts[cat] = (prodCounts[cat] || 0) + 1;
    }
    return Object.entries(prodCounts).map(([name, value]) => ({ name, value }));
  }, [validOrders, products]);

  const topProducts = useMemo(() => {
    const salesMap: Record<string, { sales: number; revenue: number }> = {};
    for (const order of validOrders) {
      for (const item of order.items || []) {
        const key = item.productId;
        if (!salesMap[key]) salesMap[key] = { sales: 0, revenue: 0 };
        salesMap[key].sales += item.quantity || 1;
        salesMap[key].revenue += (item.price || 0) * (item.quantity || 1);
      }
    }
    return products
      .map(p => {
        const id = p.id || (p as any)._id;
        const stats = salesMap[id] || { sales: 0, revenue: 0 };
        return { ...p, id, sales: stats.sales, revenue: stats.revenue };
      })
      .sort((a, b) => b.revenue - a.revenue || b.sales - a.sales)
      .slice(0, 5);
  }, [validOrders, products]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From {validOrders.length} non-cancelled orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validOrders.length}</div>
            <p className="text-xs text-muted-foreground">{orders.length} total orders recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersCount}</div>
            <p className="text-xs text-muted-foreground">Registered customer accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">{totalVisitors} tracked site visits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales &amp; Revenue Overview</CardTitle>
            <CardDescription>Monthly performance computed from orders</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${symbol}${value}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="sales" stroke="hsl(var(--accent))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>{validOrders.length > 0 ? 'Units sold by category' : 'Catalog distribution by category'}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Ranked by actual order revenue.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={product.images?.[0]} alt={product.name} />
                        <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.categories?.[0] || '—'}</TableCell>
                  <TableCell className="text-right">{product.sales}</TableCell>
                  <TableCell className="text-right">{formatPrice(product.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
