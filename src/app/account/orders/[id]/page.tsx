
"use client";

import { orders as initialOrders, type Order } from "@/lib/placeholder-data";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const pdfRef = useRef<HTMLDivElement>(null);
  const id = params.id;

  useEffect(() => {
    if (id) {
        const storedOrders: Order[] = JSON.parse(localStorage.getItem('newOrders') || '[]');
        const allOrders = [...initialOrders, ...storedOrders];
        const foundOrder = allOrders.find(o => o.id === id);
        setOrder(foundOrder);
    } else {
        setOrder(null);
    }
  }, [id]);

  const handleDownloadInvoice = () => {
    const input = pdfRef.current;
    if (!input) {
      return;
    }

    html2canvas(input, {
      scale: 2,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${order?.orderNumber}.pdf`);
    });
  };

  if (order === undefined) {
    return (
        <div>
            <Skeleton className="h-12 w-1/2 mb-6" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }
  
  if (!order) {
    notFound();
  }

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
    <div>
      {/* Hidden Invoice structure for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '210mm', padding: '20mm', background: 'white', color: 'black', fontFamily: 'sans-serif' }} ref={pdfRef}>
        {order && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <img src="https://placehold.co/150x50.png" alt="Store Logo" style={{ width: '150px' }} data-ai-hint="logo" />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem' }}>eMotionView</h1>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>10/25 Eastern Plaza, Hatirpool, Dhaka-1205</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>INVOICE</h2>
                <p style={{ margin: '0.25rem 0 0' }}><strong>Invoice #:</strong> {order.orderNumber}</p>
                <p style={{ margin: '0.25rem 0 0' }}><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Customer Address</h3>
              <p style={{ margin: 0 }}>John Doe</p>
              <p style={{ margin: 0 }}>123 Main Street</p>
              <p style={{ margin: 0 }}>Anytown, USA 12345</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Item</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Quantity</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem' }}>{item.name}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <div style={{ width: '50%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span>Subtotal:</span>
                  <span>${(order.total - 5).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span>Shipping:</span>
                  <span>$5.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', marginTop: '0.5rem', borderTop: '2px solid #333', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #ccc' }}>
              <p>Thank you By eMotionView</p>
            </div>
          </div>
        )}
      </div>

      {/* Visible Part of the Page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-headline text-3xl font-bold text-foreground">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.orderNumber}</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Reorder</Button>
          <Button onClick={handleDownloadInvoice}><Download className="mr-2 h-4 w-4" /> Download Invoice</Button>
        </div>
      </div>
      
      <div className="p-1">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Date: {new Date(order.date).toLocaleDateString()}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Total: ${order.total.toFixed(2)}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Status: <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge></span>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md" data-ai-hint="product" />
                      <div>
                        {item.productType === 'Physical' ? (
                            <Link href={`/products/${item.permalink || item.productId}`} className="font-medium hover:text-primary">{item.name}</Link>
                        ) : (
                            <span className="font-medium">{item.name}</span>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                  </div>
                  {item.productType === 'Digital' && order.status === 'Delivered' && (
                    <div className="mt-2 pl-[80px] flex flex-col items-start gap-2">
                        <Button asChild size="sm">
                          <Link href={item.downloadUrl || '#'} target="_blank"><Download className="mr-2 h-4 w-4" /> Download</Link>
                        </Button>
                        {item.digitalProductNote && (
                          <p className="text-xs text-muted-foreground">{item.digitalProductNote}</p>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Shipping Address</h3>
                <address className="not-italic text-muted-foreground">
                  John Doe<br/>
                  123 Main Street<br/>
                  Anytown, USA 12345
                </address>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(order.total - 5).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Total:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
