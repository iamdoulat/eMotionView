"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, docToJSON } from "@/lib/db";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Smartphone,
  CreditCard,
  Package,
  Copy,
  Check,
  User,
  MapPin,
  Building,
} from "lucide-react";
import Link from "next/link";
import type { Order } from "@/lib/placeholder-data";
import { useToast } from "@/hooks/use-toast";

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.id) {
        setOrder(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const orderRef = doc(db, "orders", params.id);
        const docSnap = await getDoc(orderRef);

        if (docSnap.exists()) {
          const orderData = docToJSON(docSnap) as Order;
          setOrder(orderData);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copied to clipboard", description: text });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs gap-1 font-semibold">
            <Clock className="h-3.5 w-3.5" /> Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="text-xs gap-1 font-semibold">
            <XCircle className="h-3.5 w-3.5" /> Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 text-xs gap-1 font-semibold">
            <RotateCcw className="h-3.5 w-3.5" /> Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs">{status || "Unknown"}</Badge>;
    }
  };

  const renderGatewayBadge = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "bkash":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
            <Smartphone className="h-3.5 w-3.5" /> bKash Mobile
          </div>
        );
      case "sslcommerz":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <CreditCard className="h-3.5 w-3.5" /> SSLCommerz Payment Gateway
          </div>
        );
      case "cod":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Package className="h-3.5 w-3.5" /> Cash on Delivery
          </div>
        );
      default:
        return <Badge variant="outline" className="text-xs">{method?.toUpperCase() || "N/A"}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle>Payment Transaction Not Found</CardTitle>
            <CardDescription>
              The requested payment transaction could not be located in the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/admin/payments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Payment Transactions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trxId =
    order.paymentDetails?.bkash?.trxID ||
    order.paymentDetails?.sslcommerz?.tran_id ||
    order.paymentDetails?.bkash?.transactionID ||
    order.paymentDetails?.bkash?.paymentID ||
    "N/A";

  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-xs">
            <Link href="/admin/payments">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Payments
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Transaction Details
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {order.orderNumber}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Processed on {new Date(order.date).toLocaleString("en-GB")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {renderStatusBadge(order.paymentStatus)}
          {renderGatewayBadge(order.paymentMethod)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settlement & Gateway Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Settlement Card */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Settlement Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Total Amount</span>
                  <div className="text-xl font-bold text-foreground mt-0.5">
                    ৳{order.total.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">
                    Currency: {order.currency || "BDT"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block">Payment Status</span>
                  <div className="mt-1">{renderStatusBadge(order.paymentStatus)}</div>
                </div>

                <div>
                  <span className="text-muted-foreground block">Fulfillment Status</span>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {order.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* bKash Details */}
          {order.paymentMethod === "bkash" && order.paymentDetails?.bkash && (
            <Card className="border border-pink-500/30 bg-pink-50/10 dark:bg-pink-950/5 shadow-xs">
              <CardHeader className="pb-3 border-b border-pink-500/20">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-pink-600" />
                  <CardTitle className="text-base font-bold">bKash Gateway Transaction</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-lg border bg-background">
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans">Payment ID</span>
                    <span className="text-xs font-bold text-foreground">{order.paymentDetails.bkash.paymentID}</span>
                  </div>
                  <div className="p-3 rounded-lg border bg-background">
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans">bKash TrxID</span>
                    <span className="text-xs font-bold text-foreground">
                      {order.paymentDetails.bkash.trxID || order.paymentDetails.bkash.transactionID || "N/A"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border bg-background">
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans">Customer Mobile</span>
                    <span className="text-xs font-bold text-foreground">
                      {order.paymentDetails.bkash.customerMsisdn || "N/A"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border bg-background">
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans">Merchant Invoice</span>
                    <span className="text-xs font-bold text-foreground">
                      {order.paymentDetails.bkash.merchantInvoiceNumber || order.orderNumber}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SSLCommerz Details */}
          {order.paymentMethod === "sslcommerz" && order.paymentDetails?.sslcommerz && (
            <Card className="border border-blue-500/30 bg-blue-50/10 dark:bg-blue-950/5 shadow-xs">
              <CardHeader className="pb-3 border-b border-blue-500/20">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base font-bold">SSLCommerz Transaction Verification</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-lg border bg-background">
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans">Transaction ID (tran_id)</span>
                    <span className="text-xs font-bold text-foreground">{order.paymentDetails.sslcommerz.tran_id}</span>
                  </div>
                  <div className="p-3 rounded-lg border bg-background">
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans">Validation ID (val_id)</span>
                    <span className="text-xs font-bold text-foreground">{order.paymentDetails.sslcommerz.val_id}</span>
                  </div>
                  <div className="p-3 rounded-lg border bg-background">
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans">Card Type & Issuer</span>
                    <span className="text-xs font-bold text-foreground">
                      {[order.paymentDetails.sslcommerz.card_type, order.paymentDetails.sslcommerz.card_issuer].filter(Boolean).join(" - ") || "Card"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border bg-background">
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans">Bank Reference</span>
                    <span className="text-xs font-bold text-foreground">
                      {order.paymentDetails.sslcommerz.bank_tran_id || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items Purchased Table */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-16 text-center">Qty</TableHead>
                    <TableHead className="w-24 text-right">Unit Price</TableHead>
                    <TableHead className="w-28 text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{item.name}</div>
                        {item.sku && <div className="text-[10px] font-mono text-muted-foreground">SKU: {item.sku}</div>}
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer & Delivery */}
        <div className="space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-bold">Customer Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Customer Name</span>
                <strong className="text-foreground text-sm">{order.customerName}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Email</span>
                <a href={`mailto:${order.customerEmail}`} className="text-primary hover:underline font-medium">
                  {order.customerEmail}
                </a>
              </div>
              <div>
                <span className="text-muted-foreground block">Phone</span>
                <span className="font-mono text-foreground font-medium">
                  {order.shippingAddress?.phone || "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <CardTitle className="text-base font-bold">Delivery Address</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                <div className="text-foreground font-semibold">{order.shippingAddress.street}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </div>
                <div>{order.shippingAddress.country}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
