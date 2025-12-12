
"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, Users, CreditCard, Eye, ShoppingBag } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { SeedButton } from "@/components/admin/seed-button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { db, docToJSON } from "@/lib/firebase"
import type { Order, User } from "@/lib/placeholder-data"

const initialData = [
  { name: "Jan", total: 0 },
  { name: "Feb", total: 0 },
  { name: "Mar", total: 0 },
  { name: "Apr", total: 0 },
  { name: "May", total: 0 },
  { name: "Jun", total: 0 },
  { name: "Jul", total: 0 },
  { name: "Aug", total: 0 },
  { name: "Sep", total: 0 },
  { name: "Oct", total: 0 },
  { name: "Nov", total: 0 },
  { name: "Dec", total: 0 },
]

interface DashboardStats {
  totalRevenue: number;
  totalCustomers: number;
  totalSales: number;
  dailyVisitors: number;
  chartData: { name: string; total: number }[];
  recentSales: Order[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const ordersCollectionRef = collection(db, 'orders');
        const customersCollectionRef = collection(db, 'customers');

        const ordersQuery = query(ordersCollectionRef);
        const deliveredOrdersQuery = query(ordersCollectionRef, where('status', '==', 'Delivered'));
        const recentSalesQuery = query(ordersCollectionRef, orderBy('date', 'desc'), limit(10));

        const [
          ordersSnapshot,
          deliveredOrdersSnapshot,
          customersSnapshot,
          recentSalesSnapshot
        ] = await Promise.all([
          getDocs(ordersQuery),
          getDocs(deliveredOrdersQuery),
          getDocs(customersCollectionRef),
          getDocs(recentSalesQuery)
        ]);

        const today = new Date().toISOString().split('T')[0];
        const visitorDocRef = doc(db, 'analytics', `daily_visits_${today}`);
        const visitorDoc = await getDoc(visitorDocRef);

        const allOrders = ordersSnapshot.docs.map(docToJSON) as Order[];
        const deliveredOrders = deliveredOrdersSnapshot.docs.map(docToJSON) as Order[];

        const totalCustomers = customersSnapshot.size;
        console.log('Customers snapshot size:', totalCustomers);
        console.log('Customers docs count:', customersSnapshot.docs.length);

        const nonCancelledOrders = allOrders.filter(o => o.status !== 'Cancelled');

        const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
        const totalSales = nonCancelledOrders.length;

        const monthlyRevenue = [...initialData].map(m => ({ ...m }));
        deliveredOrders.forEach(order => {
          const month = new Date(order.date).getMonth();
          monthlyRevenue[month].total += order.total;
        });

        const recentSales = recentSalesSnapshot.docs.map(doc => docToJSON(doc) as Order);

        const dailyVisitors = visitorDoc.exists() ? visitorDoc.data().count : 0;

        console.log('Dashboard stats:', { totalRevenue, totalCustomers, totalSales, dailyVisitors });

        setStats({
          totalRevenue,
          totalCustomers,
          totalSales,
          dailyVisitors,
          chartData: monthlyRevenue,
          recentSales
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        if (error instanceof Error) {
          console.error("Error details:", error.message);
        }
        // Set stats with 0 values to prevent undefined errors
        setStats({
          totalRevenue: 0,
          totalCustomers: 0,
          totalSales: 0,
          dailyVisitors: 0,
          chartData: initialData,
          recentSales: []
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <SeedButton />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${stats?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  Based on all delivered orders
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">+{stats?.totalCustomers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total registered customers
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">+{stats?.totalSales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total non-cancelled orders
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Visitors</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">+{stats?.dailyVisitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Unique visitors today
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Monthly revenue from delivered orders.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? <Skeleton className="w-full h-[350px]" /> : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats?.chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsla(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Your 10 most recent sales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-8">
                {[...Array(10)].map((_, i) => (
                  <div className="flex items-center" key={i}>
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <Skeleton className="ml-auto h-4 w-[60px]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {stats?.recentSales.map(order => (
                  <div key={order.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={order.customerAvatar} alt={order.customerName} data-ai-hint="person face" />
                      <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.orderNumber}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">${order.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales & Revenue Trends</CardTitle>
            <CardDescription>Detailed sales and revenue analysis</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stats?.chartData || initialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Breakdown of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <div className="flex items-center justify-center h-[350px]">
                <p className="text-sm text-muted-foreground">Status distribution chart (Coming soon)</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products/Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Revenue</CardTitle>
          <CardDescription>Customers with highest order values</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentSales.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={order.customerAvatar} alt={order.customerName} data-ai-hint="person face" />
                          <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{order.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{order.customerEmail}</TableCell>
                    <TableCell className="text-right">1</TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
