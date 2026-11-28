"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { collection, query, getDocs, orderBy, doc, setDoc, docToJSON } from "@/lib/db";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/placeholder-data";
import {
  Search,
  Download,
  Loader2,
  ExternalLink,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  Eye,
  SlidersHorizontal,
  FileSpreadsheet,
  FileCode,
  DollarSign,
  TrendingUp,
  Receipt,
  User,
  MapPin,
  Package,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  Building,
  RefreshCw,
} from "lucide-react";

// Realistic sample payment records for fallback if DB is empty
const SAMPLE_ORDERS: Order[] = [
  {
    id: "ord-bkash-001",
    userId: "usr-101",
    orderNumber: "ORD-2026-9041",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: "Tanvir Ahmed",
    customerAvatar: "https://placehold.co/100x100.png",
    customerEmail: "tanvir.ahmed@example.com",
    status: "Processing",
    total: 3099,
    currency: "BDT",
    paymentMethod: "bkash",
    paymentStatus: "completed",
    paymentDetails: {
      method: "bkash",
      status: "completed",
      bkash: {
        paymentID: "TR001192847192",
        trxID: "BK9082X719",
        transactionID: "BK9082X719",
        customerMsisdn: "01711223344",
        payerReference: "Tanvir-RT3",
        amount: 3099,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: "INV-2026-9041",
      },
    },
    items: [
      {
        productId: "prod-1",
        name: "Haylou Solar Plus RT3 Smartwatch",
        image: "https://placehold.co/100x100.png",
        quantity: 1,
        price: 3099,
        productType: "Physical",
        sku: "HL-RT3-BLK",
      },
    ],
    shippingAddress: {
      street: "House 24, Road 7, Dhanmondi",
      city: "Dhaka",
      state: "Dhaka",
      zipCode: "1205",
      country: "Bangladesh",
      phone: "+880 1711-223344",
    },
  },
  {
    id: "ord-ssl-002",
    userId: "usr-102",
    orderNumber: "ORD-2026-9042",
    date: new Date(Date.now() - 3600000 * 6).toISOString(),
    customerName: "Nusrat Jahan",
    customerAvatar: "https://placehold.co/100x100.png",
    customerEmail: "nusrat.jahan@example.com",
    status: "Delivered",
    total: 4250,
    currency: "BDT",
    paymentMethod: "sslcommerz",
    paymentStatus: "completed",
    paymentDetails: {
      method: "sslcommerz",
      status: "completed",
      sslcommerz: {
        tran_id: "SSL-9082410-TX",
        val_id: "VAL-889123019",
        amount: 4250,
        currency: "BDT",
        card_type: "VISA-CityBank",
        card_no: "411111XXXXXX1111",
        bank_tran_id: "BK-TX-891029",
        status: "VALID",
        tran_date: new Date(Date.now() - 3600000 * 6).toISOString(),
        card_issuer: "City Bank Ltd",
        card_brand: "VISA",
        risk_level: "0",
        risk_title: "Safe Transaction",
      },
    },
    items: [
      {
        productId: "prod-2",
        name: "KOSPET TANK T2 Smartwatch",
        image: "https://placehold.co/100x100.png",
        quantity: 1,
        price: 4250,
        productType: "Physical",
        sku: "KP-TK2-SLV",
      },
    ],
    shippingAddress: {
      street: "Plot 12, Block C, Banani",
      city: "Dhaka",
      state: "Dhaka",
      zipCode: "1213",
      country: "Bangladesh",
      phone: "+880 1819-556677",
    },
  },
  {
    id: "ord-cod-003",
    userId: "usr-103",
    orderNumber: "ORD-2026-9043",
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
    customerName: "Rafiul Karim",
    customerAvatar: "https://placehold.co/100x100.png",
    customerEmail: "rafiul.karim@example.com",
    status: "Shipped",
    total: 1850,
    currency: "BDT",
    paymentMethod: "cod",
    paymentStatus: "pending",
    paymentDetails: {
      method: "cod",
      status: "pending",
    },
    items: [
      {
        productId: "prod-3",
        name: "Soundpeats Air4 Wireless Earbuds",
        image: "https://placehold.co/100x100.png",
        quantity: 1,
        price: 1850,
        productType: "Physical",
        sku: "SP-AIR4-WHT",
      },
    ],
    shippingAddress: {
      street: "House 5, Road 2, Nasirabad",
      city: "Chittagong",
      state: "Chittagong",
      zipCode: "4000",
      country: "Bangladesh",
      phone: "+880 1912-334455",
    },
  },
  {
    id: "ord-bkash-004",
    userId: "usr-104",
    orderNumber: "ORD-2026-9044",
    date: new Date(Date.now() - 3600000 * 30).toISOString(),
    customerName: "Mahmud Hasan",
    customerAvatar: "https://placehold.co/100x100.png",
    customerEmail: "mahmud.h@example.com",
    status: "Pending",
    total: 2199,
    currency: "BDT",
    paymentMethod: "bkash",
    paymentStatus: "failed",
    paymentDetails: {
      method: "bkash",
      status: "failed",
      bkash: {
        paymentID: "TR001192847999",
        trxID: "",
        customerMsisdn: "01610998877",
        amount: 2199,
        currency: "BDT",
        intent: "sale",
      },
    },
    items: [
      {
        productId: "prod-4",
        name: "QCY T13 ANC Wireless Earbuds",
        image: "https://placehold.co/100x100.png",
        quantity: 1,
        price: 2199,
        productType: "Physical",
        sku: "QCY-T13-BLK",
      },
    ],
    shippingAddress: {
      street: "Sector 4, Uttara",
      city: "Dhaka",
      state: "Dhaka",
      zipCode: "1230",
      country: "Bangladesh",
      phone: "+880 1610-998877",
    },
  },
  {
    id: "ord-ssl-005",
    userId: "usr-105",
    orderNumber: "ORD-2026-9045",
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    customerName: "Farhana Akter",
    customerAvatar: "https://placehold.co/100x100.png",
    customerEmail: "farhana.akter@example.com",
    status: "Cancelled",
    total: 3499,
    currency: "BDT",
    paymentMethod: "sslcommerz",
    paymentStatus: "refunded",
    paymentDetails: {
      method: "sslcommerz",
      status: "refunded",
      sslcommerz: {
        tran_id: "SSL-9082499-TX",
        val_id: "VAL-889123999",
        amount: 3499,
        currency: "BDT",
        card_type: "Mastercard-EBL",
        card_no: "541275XXXXXX2222",
        bank_tran_id: "BK-TX-891999",
        status: "REFUNDED",
        tran_date: new Date(Date.now() - 3600000 * 48).toISOString(),
        card_issuer: "Eastern Bank Ltd",
        card_brand: "Mastercard",
      },
    },
    items: [
      {
        productId: "prod-5",
        name: "Xiaomi Smart Band 8 Active",
        image: "https://placehold.co/100x100.png",
        quantity: 1,
        price: 3499,
        productType: "Physical",
        sku: "MI-B8-BLK",
      },
    ],
    shippingAddress: {
      street: "Kazir Dewri",
      city: "Chittagong",
      state: "Chittagong",
      zipCode: "4000",
      country: "Bangladesh",
      phone: "+880 1722-445566",
    },
  },
];

export default function PaymentsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Selected Order for Modal Inspector
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalTab, setModalTab] = useState("overview");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch orders from Firestore or fall back to SAMPLE_ORDERS
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setOrders(SAMPLE_ORDERS);
      } else {
        const ordersData: Order[] = [];
        querySnapshot.forEach((doc) => {
          ordersData.push(docToJSON(doc) as Order);
        });
        const withPayments = ordersData.filter((o) => o.paymentMethod);
        setOrders(withPayments.length > 0 ? withPayments : SAMPLE_ORDERS);
      }
    } catch {
      setOrders(SAMPLE_ORDERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q) ||
        (order.shippingAddress?.phone && order.shippingAddress.phone.includes(q)) ||
        (order.paymentDetails?.bkash?.trxID && order.paymentDetails.bkash.trxID.toLowerCase().includes(q)) ||
        (order.paymentDetails?.bkash?.paymentID && order.paymentDetails.bkash.paymentID.toLowerCase().includes(q)) ||
        (order.paymentDetails?.sslcommerz?.tran_id && order.paymentDetails.sslcommerz.tran_id.toLowerCase().includes(q));

      // 2. Gateway Filter
      const matchesGateway =
        gatewayFilter === "all" ||
        (order.paymentMethod || "").toLowerCase() === gatewayFilter.toLowerCase();

      // 3. Status Filter
      const matchesStatus =
        statusFilter === "all" ||
        (order.paymentStatus || "").toLowerCase() === statusFilter.toLowerCase();

      // 4. Date Range Filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const orderTime = new Date(order.date).getTime();
        const now = Date.now();
        if (dateFilter === "today") {
          matchesDate = now - orderTime <= 86400000;
        } else if (dateFilter === "7days") {
          matchesDate = now - orderTime <= 86400000 * 7;
        } else if (dateFilter === "30days") {
          matchesDate = now - orderTime <= 86400000 * 30;
        }
      }

      return matchesSearch && matchesGateway && matchesStatus && matchesDate;
    });
  }, [orders, searchQuery, gatewayFilter, statusFilter, dateFilter]);

  // Financial Statistics
  const financialStats = useMemo(() => {
    let totalRevenue = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let pendingAmount = 0;
    let failedCount = 0;
    let failedAmount = 0;
    let refundedCount = 0;
    let refundedAmount = 0;

    let bkashCount = 0;
    let sslCount = 0;
    let codCount = 0;

    orders.forEach((o) => {
      const status = (o.paymentStatus || "pending").toLowerCase();
      const method = (o.paymentMethod || "").toLowerCase();

      if (status === "completed") {
        totalRevenue += o.total;
        completedCount++;
      } else if (status === "pending") {
        pendingCount++;
        pendingAmount += o.total;
      } else if (status === "failed") {
        failedCount++;
        failedAmount += o.total;
      } else if (status === "refunded") {
        refundedCount++;
        refundedAmount += o.total;
      }

      if (method === "bkash") bkashCount++;
      else if (method === "sslcommerz") sslCount++;
      else if (method === "cod") codCount++;
    });

    const completionRate =
      orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 0;

    return {
      totalRevenue,
      completedCount,
      completionRate,
      pendingCount,
      pendingAmount,
      failedCount,
      failedAmount,
      refundedCount,
      refundedAmount,
      bkashCount,
      sslCount,
      codCount,
    };
  }, [orders]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copied to clipboard", description: text });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Update Payment Status in DB
  const handleUpdatePaymentStatus = async (newStatus: "completed" | "pending" | "failed" | "refunded") => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const updatedOrder: Order = {
        ...selectedOrder,
        paymentStatus: newStatus,
        paymentDetails: {
          ...(selectedOrder.paymentDetails || { method: selectedOrder.paymentMethod || "cod", status: newStatus }),
          status: newStatus,
        },
      };

      const docRef = doc(db, "orders", selectedOrder.id);
      await setDoc(docRef, updatedOrder, { merge: true });

      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o))
      );
      setSelectedOrder(updatedOrder);

      toast({
        title: "Payment Status Updated",
        description: `Order #${selectedOrder.orderNumber} status changed to ${newStatus}.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update payment status in database.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Payment Gateway",
      "Amount (BDT)",
      "Payment Status",
      "Transaction ID",
      "Payment ID",
    ];

    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.date).toISOString().split("T")[0],
      `"${o.customerName}"`,
      o.customerEmail,
      o.shippingAddress?.phone || "N/A",
      (o.paymentMethod || "N/A").toUpperCase(),
      o.total.toFixed(2),
      o.paymentStatus || "pending",
      o.paymentDetails?.bkash?.trxID ||
      o.paymentDetails?.sslcommerz?.tran_id ||
      o.paymentDetails?.bkash?.transactionID ||
      "N/A",
      o.paymentDetails?.bkash?.paymentID || o.paymentDetails?.sslcommerz?.val_id || "N/A",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Export Complete",
      description: `Exported ${filteredOrders.length} transaction records.`,
    });
  };

  // Badges
  const renderStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px] gap-1 font-semibold">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px] gap-1 font-semibold">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="text-[11px] gap-1 font-semibold">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 text-[11px] gap-1 font-semibold">
            <RotateCcw className="h-3 w-3" /> Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[11px]">{status || "Unknown"}</Badge>;
    }
  };

  const renderGatewayBadge = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "bkash":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
            <Smartphone className="h-3 w-3" /> bKash
          </div>
        );
      case "sslcommerz":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <CreditCard className="h-3 w-3" /> SSLCommerz
          </div>
        );
      case "cod":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Package className="h-3 w-3" /> Cash on Delivery
          </div>
        );
      case "stripe":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <CreditCard className="h-3 w-3" /> Stripe
          </div>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {method?.toUpperCase() || "N/A"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          FINANCIAL METRIC CARDS
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Revenue Collected</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                ৳{financialStats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                From <strong className="text-foreground">{financialStats.completedCount}</strong> successful payments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Payment Success Rate</span>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {financialStats.completionRate}%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Across {orders.length} total orders recorded
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending / COD */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Pending / COD Volume</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                ৳{financialStats.pendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                <strong className="text-foreground">{financialStats.pendingCount}</strong> awaiting fulfillment/confirmation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Failed / Refunded */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Failed & Refunds</span>
              <div className="h-8 w-8 rounded-lg bg-red-500/10 text-destructive flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                ৳{(financialStats.failedAmount + financialStats.refundedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {financialStats.failedCount} failed, {financialStats.refundedCount} refunded
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =========================================================================
          MAIN TRANSACTIONS CARD
      ========================================================================= */}
      <Card className="border border-border/80 shadow-sm">
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold tracking-tight">Payment Transactions</CardTitle>
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-primary/5 text-primary border-primary/20">
                  Billing & Settlement
                </Badge>
              </div>
              <CardDescription className="text-sm mt-1">
                Monitor multi-gateway transaction logs (bKash, SSLCommerz, Cash on Delivery) and verify payment receipts.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={isLoading}
                className="h-9 text-xs font-medium border-border hover:bg-muted"
              >
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredOrders.length === 0}
                className="h-9 text-xs font-semibold border-border hover:bg-muted"
              >
                <Download className="mr-2 h-3.5 w-3.5 text-primary" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Controls & Gateway Summary */}
        <CardContent className="pt-0 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 pb-4 border-t border-border/50">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order #, customer, TrxID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-background"
              />
            </div>

            {/* Select Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Gateway Filter */}
              <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
                <SelectTrigger className="w-[145px] h-9 text-xs">
                  <SelectValue placeholder="All Gateways" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  <SelectItem value="bkash">bKash Mobile</SelectItem>
                  <SelectItem value="sslcommerz">SSLCommerz Cards</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[135px] h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[125px] h-9 text-xs">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Past 24 Hours</SelectItem>
                  <SelectItem value="7days">Past 7 Days</SelectItem>
                  <SelectItem value="30days">Past 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-xl border border-border/80 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[150px]">Order & Date</TableHead>
                  <TableHead className="w-[200px]">Customer</TableHead>
                  <TableHead className="w-[150px]">Payment Gateway</TableHead>
                  <TableHead>Transaction Reference</TableHead>
                  <TableHead className="w-[120px]">Amount</TableHead>
                  <TableHead className="w-[110px] text-center">Status</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-sm">Loading transactions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Receipt className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium">No payment transactions found</p>
                        <p className="text-xs text-muted-foreground/80">
                          {searchQuery ? "Try refining your search query or reset filters." : "Transactions will appear here as customers checkout."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const trxId =
                      order.paymentDetails?.bkash?.trxID ||
                      order.paymentDetails?.sslcommerz?.tran_id ||
                      order.paymentDetails?.bkash?.transactionID ||
                      order.paymentDetails?.bkash?.paymentID ||
                      (order.paymentMethod === "cod" ? "COD-VERIFY" : "N/A");

                    return (
                      <TableRow
                        key={order.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {/* Order & Date */}
                        <TableCell className="font-medium">
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-foreground font-mono">
                              {order.orderNumber}
                            </span>
                            <div className="text-[11px] text-muted-foreground">
                              {new Date(order.date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </TableCell>

                        {/* Customer */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="font-semibold text-xs text-foreground truncate max-w-[180px]">
                              {order.customerName}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                              {order.customerEmail}
                            </div>
                            {order.shippingAddress?.phone && (
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {order.shippingAddress.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Payment Gateway */}
                        <TableCell>
                          {renderGatewayBadge(order.paymentMethod)}
                        </TableCell>

                        {/* Transaction ID */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className="bg-muted px-2 py-0.5 rounded text-[11px] text-foreground truncate max-w-[190px]">
                              {trxId}
                            </span>
                            {trxId !== "N/A" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(trxId, `trx-${order.id}`);
                                }}
                                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                                title="Copy Transaction ID"
                              >
                                {copiedKey === `trx-${order.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell>
                          <div className="font-bold text-sm text-foreground">
                            ৳{order.total.toFixed(2)}
                          </div>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">
                            {order.currency || "BDT"}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          {renderStatusBadge(order.paymentStatus)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs">Transaction Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setSelectedOrder(order)} className="cursor-pointer">
                                <Eye className="mr-2 h-3.5 w-3.5 text-primary" /> Inspect Details
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/payments/${order.id}`} className="cursor-pointer flex items-center">
                                  <ExternalLink className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Full Page View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-[10px] text-muted-foreground">Quick Status Update</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={async () => {
                                  setSelectedOrder(order);
                                  await handleUpdatePaymentStatus("completed");
                                }}
                                className="cursor-pointer text-emerald-600 focus:text-emerald-700"
                              >
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  setSelectedOrder(order);
                                  await handleUpdatePaymentStatus("refunded");
                                }}
                                className="cursor-pointer text-purple-600 focus:text-purple-700"
                              >
                                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Mark Refunded
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  setSelectedOrder(order);
                                  await handleUpdatePaymentStatus("failed");
                                }}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <XCircle className="mr-2 h-3.5 w-3.5" /> Mark Failed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/50 py-3">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> recorded payment transactions.
          </div>
        </CardFooter>
      </Card>

      {/* =========================================================================
          INTERACTIVE TRANSACTION DETAILS MODAL
      ========================================================================= */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="sm:max-w-2xl lg:max-w-3xl w-[95vw] h-[85vh] max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card gap-0">
            {/* PINNED MODAL HEADER */}
            <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 shrink-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
                      Transaction Inspector
                    </Badge>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-foreground font-bold">
                      {selectedOrder.orderNumber}
                    </span>
                    {renderGatewayBadge(selectedOrder.paymentMethod)}
                  </div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    ৳{selectedOrder.total.toFixed(2)} {selectedOrder.currency || "BDT"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Processed on {new Date(selectedOrder.date).toLocaleString("en-GB")}
                  </DialogDescription>
                </div>

                <div className="hidden sm:flex items-center gap-2 sm:mr-8">
                  {renderStatusBadge(selectedOrder.paymentStatus)}
                </div>
              </div>
            </DialogHeader>

            {/* PINNED TABS NAV */}
            <div className="px-6 pt-3.5 pb-2 border-b border-border/40 bg-card/60 shrink-0">
              <Tabs value={modalTab} onValueChange={setModalTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-xl">
                  <TabsTrigger value="overview" className="flex items-center gap-2 text-xs font-semibold py-2">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Summary</span>
                  </TabsTrigger>
                  <TabsTrigger value="gateway" className="flex items-center gap-2 text-xs font-semibold py-2">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Gateway Payload</span>
                  </TabsTrigger>
                  <TabsTrigger value="items" className="flex items-center gap-2 text-xs font-semibold py-2">
                    <Package className="h-3.5 w-3.5" />
                    <span>Items & Delivery</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* SCROLLABLE MODAL BODY */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 overscroll-contain modal-scrollbar space-y-6">
              {/* TAB 1: OVERVIEW */}
              {modalTab === "overview" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Amount Card */}
                    <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                      <span className="text-xs text-muted-foreground">Settlement Amount</span>
                      <div className="text-2xl font-bold text-foreground">
                        ৳{selectedOrder.total.toFixed(2)}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Currency: {selectedOrder.currency || "BDT"}
                      </span>
                    </div>

                    {/* Status Card */}
                    <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                      <span className="text-xs text-muted-foreground">Current Payment Status</span>
                      <div className="mt-1">{renderStatusBadge(selectedOrder.paymentStatus)}</div>
                      <span className="text-[11px] text-muted-foreground">
                        Order Fulfillment: <strong>{selectedOrder.status}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Customer Information Card */}
                  <div className="p-4 rounded-xl border bg-card space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <User className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-bold text-foreground">Customer & Billing Details</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Customer Name:</span>
                        <strong className="text-foreground">{selectedOrder.customerName}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Email Address:</span>
                        <a href={`mailto:${selectedOrder.customerEmail}`} className="text-primary hover:underline">
                          {selectedOrder.customerEmail}
                        </a>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Contact Phone:</span>
                        <span className="font-mono text-foreground">
                          {selectedOrder.shippingAddress?.phone || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">User / Customer ID:</span>
                        <span className="font-mono text-muted-foreground">{selectedOrder.userId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Update Status Actions */}
                  <div className="p-4 rounded-xl border bg-muted/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-foreground">Quick Status Override</Label>
                      <span className="text-[11px] text-muted-foreground">Syncs directly with database</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={selectedOrder.paymentStatus === "completed" ? "default" : "outline"}
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdatePaymentStatus("completed")}
                        className="h-8 text-xs font-semibold"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                        Completed
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedOrder.paymentStatus === "pending" ? "default" : "outline"}
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdatePaymentStatus("pending")}
                        className="h-8 text-xs font-semibold"
                      >
                        <Clock className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                        Pending
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedOrder.paymentStatus === "refunded" ? "default" : "outline"}
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdatePaymentStatus("refunded")}
                        className="h-8 text-xs font-semibold"
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-purple-500" />
                        Refunded
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedOrder.paymentStatus === "failed" ? "default" : "outline"}
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdatePaymentStatus("failed")}
                        className="h-8 text-xs font-semibold"
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5 text-destructive" />
                        Failed
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GATEWAY PAYLOAD */}
              {modalTab === "gateway" && (
                <div className="space-y-4">
                  {/* bKash Details */}
                  {selectedOrder.paymentMethod === "bkash" && (
                    <div className="p-4 rounded-xl border bg-pink-50/30 dark:bg-pink-950/10 border-pink-500/30 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-pink-500/20">
                        <Smartphone className="h-4 w-4 text-pink-600" />
                        <h4 className="text-xs font-bold text-foreground">bKash Payment Gateway Response</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-[10px] text-muted-foreground uppercase block font-sans">Payment ID</span>
                          <span className="text-xs font-bold text-foreground">
                            {selectedOrder.paymentDetails?.bkash?.paymentID || "N/A"}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-[10px] text-muted-foreground uppercase block font-sans">bKash TrxID</span>
                          <span className="text-xs font-bold text-foreground">
                            {selectedOrder.paymentDetails?.bkash?.trxID ||
                              selectedOrder.paymentDetails?.bkash?.transactionID ||
                              "N/A"}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-[10px] text-muted-foreground uppercase block font-sans">Customer MSISDN (Wallet)</span>
                          <span className="text-xs font-bold text-foreground">
                            {selectedOrder.paymentDetails?.bkash?.customerMsisdn || selectedOrder.shippingAddress?.phone || "N/A"}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-[10px] text-muted-foreground uppercase block font-sans">Merchant Invoice</span>
                          <span className="text-xs font-bold text-foreground">
                            {selectedOrder.paymentDetails?.bkash?.merchantInvoiceNumber || selectedOrder.orderNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SSLCommerz Details */}
                  {selectedOrder.paymentMethod === "sslcommerz" && (
                    <div className="p-4 rounded-xl border bg-blue-50/30 dark:bg-blue-950/10 border-blue-500/30 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-blue-500/20">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-foreground">SSLCommerz Settlement Details</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-[10px] text-muted-foreground uppercase block font-sans">Transaction ID (tran_id)</span>
                          <span className="text-xs font-bold text-foreground">
                            {selectedOrder.paymentDetails?.sslcommerz?.tran_id || "N/A"}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-[10px] text-muted-foreground uppercase block font-sans">Validation ID (val_id)</span>
                          <span className="text-xs font-bold text-foreground">
                            {selectedOrder.paymentDetails?.sslcommerz?.val_id || "N/A"}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-[10px] text-muted-foreground uppercase block font-sans">Card Type & Issuer</span>
                          <span className="text-xs font-bold text-foreground">
                            {[selectedOrder.paymentDetails?.sslcommerz?.card_type, selectedOrder.paymentDetails?.sslcommerz?.card_issuer]
                              .filter(Boolean)
                              .join(" - ") || "Card"}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-background border">
                          <span className="text-[10px] text-muted-foreground uppercase block font-sans">Bank Reference</span>
                          <span className="text-xs font-bold text-foreground">
                            {selectedOrder.paymentDetails?.sslcommerz?.bank_tran_id || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash on Delivery Details */}
                  {selectedOrder.paymentMethod === "cod" && (
                    <div className="p-4 rounded-xl border bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-500/30 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
                        <Package className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                        <h4 className="text-xs font-bold text-foreground">Cash on Delivery Settlement</h4>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Amount to collect upon delivery: <strong>৳{selectedOrder.total.toFixed(2)}</strong>.
                        Please ensure the courier delivery agent marks this order as completed upon cash receipt.
                      </p>
                    </div>
                  )}

                  {/* Raw JSON Debug Box */}
                  <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-mono text-muted-foreground">Raw Payment Object</Label>
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(selectedOrder.paymentDetails || {}, null, 2), "raw-json")}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        {copiedKey === "raw-json" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        Copy JSON
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-background border text-[11px] font-mono overflow-x-auto modal-scrollbar max-h-48 text-muted-foreground">
                      {JSON.stringify(selectedOrder.paymentDetails || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 3: ITEMS & DELIVERY */}
              {modalTab === "items" && (
                <div className="space-y-4">
                  {/* Items list */}
                  <div className="rounded-xl border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead>Product Item</TableHead>
                          <TableHead className="w-20 text-center">Qty</TableHead>
                          <TableHead className="w-24 text-right">Unit Price</TableHead>
                          <TableHead className="w-24 text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <div className="space-y-0.5">
                                <span className="font-semibold text-xs text-foreground">{item.name}</span>
                                {item.sku && (
                                  <div className="text-[10px] font-mono text-muted-foreground">SKU: {item.sku}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs">{item.quantity}</TableCell>
                            <TableCell className="text-right font-mono text-xs">৳{item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-bold text-xs">
                              ৳{(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="p-4 rounded-xl border bg-card space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <MapPin className="h-4 w-4 text-red-500" />
                        Shipping Destination
                      </div>
                      <div className="text-muted-foreground leading-relaxed pl-6">
                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.country} ({selectedOrder.shippingAddress.zipCode})
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PINNED MODAL FOOTER */}
            <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between sm:justify-between shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedOrder(null)}
                className="h-9 text-xs"
              >
                Close Inspector
              </Button>

              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="h-9 text-xs">
                  <Link href={`/admin/payments/${selectedOrder.id}`}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    Dedicated Page
                  </Link>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
