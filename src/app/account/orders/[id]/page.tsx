import { orders } from "@/lib/placeholder-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw } from "lucide-react";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = orders.find(o => o.id === params.id);
  
  if (!order) {
    notFound();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-headline text-3xl font-bold text-foreground">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.orderNumber}</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Reorder</Button>
          <Button><Download className="mr-2 h-4 w-4" /> Download Invoice</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Date: {new Date(order.date).toLocaleDateString()}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Total: ${order.total.toFixed(2)}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Status: <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Cancelled' ? 'destructive' : 'secondary'}>{order.status}</Badge></span>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-lg mb-4">Items Ordered</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md" data-ai-hint="product" />
                  <div>
                    <Link href={`/products/${item.productId}`} className="font-medium hover:text-primary">{item.name}</Link>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">${item.price.toFixed(2)}</p>
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
  );
}
