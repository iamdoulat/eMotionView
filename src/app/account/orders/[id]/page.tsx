"use client";

import { type Order } from "@/lib/placeholder-data";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { doc, getDoc } from "firebase/firestore";
import { db, docToJSON } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import QRCode from 'qrcode';

export default function OrderDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { user, role, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const { addToCart } = useCart();
    const [order, setOrder] = useState<Order | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [formattedDate, setFormattedDate] = useState('');
    const [formattedInvoiceDate, setFormattedInvoiceDate] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const pdfRef = useRef<HTMLDivElement>(null);
    const id = params.id;

    useEffect(() => {
        if (isAuthLoading) return;

        if (!user) {
            router.push('/sign-in');
            return;
        }

        if (!id) {
            setOrder(null);
            setIsLoading(false);
            return;
        }

        const fetchOrder = async () => {
            setIsLoading(true);
            try {
                const orderRef = doc(db, 'orders', id as string);
                const docSnap = await getDoc(orderRef);

                if (docSnap.exists()) {
                    const foundOrder = docToJSON(docSnap) as Order;

                    // Verify the order belongs to the current user OR user is admin/staff
                    const isAdminUser = role && ['Admin', 'Manager', 'Staff'].includes(role);
                    const orderBelongsToUser =
                        foundOrder.userId === user.uid ||
                        (!!foundOrder.customerEmail && foundOrder.customerEmail === user.email);

                    if (!orderBelongsToUser && !isAdminUser) {
                        console.error("Order does not belong to current user");
                        setOrder(null);
                    } else {
                        setOrder(foundOrder);
                        setFormattedDate(new Date(foundOrder.date).toLocaleDateString());
                        setFormattedInvoiceDate(new Date(foundOrder.date).toLocaleDateString());

                        // Generate QR code with order details
                        // Generate QR code with order details
                        const totalQty = foundOrder.items.reduce((sum, item) => sum + item.quantity, 0);
                        const paymentMethodLabel = foundOrder.paymentMethod === 'cod' ? 'COD' : foundOrder.paymentMethod === 'bkash' ? 'bKash' : foundOrder.paymentMethod?.toUpperCase() || 'N/A';
                        const shippingMethodLabel = foundOrder.shippingMethod?.title || 'Standard Shipping';

                        const qrData = `Order: ${foundOrder.orderNumber}\nCustomer: ${foundOrder.customerName}\nDate: ${new Date(foundOrder.date).toLocaleDateString()}\nQty: ${totalQty}\nTotal: $${foundOrder.total.toFixed(2)}\nPayment: ${paymentMethodLabel}\nShipping: ${shippingMethodLabel}`;

                        QRCode.toDataURL(qrData, { width: 112, margin: 1 })
                            .then(url => setQrCodeUrl(url))
                            .catch(err => console.error('QR Code generation error:', err));
                    }
                } else {
                    setOrder(null);
                }
            } catch (error) {
                console.error("Failed to fetch order:", error);
                setOrder(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [id, user, isAuthLoading, router]);

    const handleDownloadInvoice = () => {
        const input = pdfRef.current;
        if (!input || !order) {
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
            pdf.save(`invoice-${order.orderNumber}.pdf`);
        });
    };

    const handleReorder = async () => {
        if (!order) return;

        try {
            // Add all items from the order back to cart
            for (const item of order.items) {
                // We need to reconstruct a Product object from the order item
                const product: any = {
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    images: [item.image],
                    productType: item.productType,
                    downloadUrl: item.downloadUrl,
                    digitalProductNote: item.digitalProductNote,
                    permalink: item.permalink,
                };

                addToCart(product, item.quantity);
            }

            toast({
                title: "Items Added to Cart",
                description: `${order.items.length} item(s) have been added to your cart.`,
            });

            // Redirect to checkout after a brief delay
            setTimeout(() => {
                router.push('/checkout');
            }, 500);
        } catch (error) {
            console.error('Error reordering:', error);
            toast({
                variant: "destructive",
                title: "Reorder Failed",
                description: "There was a problem adding items to your cart.",
            });
        }
    };

    if (isLoading || isAuthLoading) {
        return (
            <div>
                <Skeleton className="h-12 w-1/2 mb-6" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!order) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Order not found</CardTitle>
                    <CardDescription>
                        We could not find this order or you don’t have access to it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/account/orders">Back to Orders</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = order.total - subtotal;

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
    };

    return (
        <div>
            {/* Hidden Invoice structure for PDF generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '210mm', padding: '20mm', background: 'white', color: 'black', fontFamily: 'sans-serif' }} ref={pdfRef}>
                {order && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #333', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                            {/* Left: Logo and Company Info */}
                            <div style={{ flex: '1' }}>
                                <img src="/logo.png" alt="eMotionView Logo" style={{ width: '180px', marginBottom: '0.5rem' }} />
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem' }}>eMotionView</h1>
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>10/25 Eastern Plaza, Hatirpool, Dhaka-1205</p>
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>Phone: 09677460460 | Email: motionview22@gmail.com.bd</p>
                            </div>

                            {/* Center: QR Code */}
                            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1rem' }}>
                                {qrCodeUrl && (
                                    <>
                                        <img src={qrCodeUrl} alt="Order QR Code" style={{ width: '112px', height: '112px' }} />
                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', textAlign: 'center' }}>Scan for Details</p>
                                    </>
                                )}
                            </div>

                            {/* Right: Invoice Text and Details */}
                            <div style={{ flex: '1', textAlign: 'right' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>INVOICE</h2>
                                <p style={{ margin: '0.25rem 0 0' }}><strong>Invoice #:</strong> {order.orderNumber}</p>
                                <p style={{ margin: '0.25rem 0 0' }}><strong>Date:</strong> {formattedInvoiceDate}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ width: '45%' }}>
                                <h3 style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Customer Address</h3>
                                <p style={{ margin: 0 }}>{order.customerName}</p>
                                {order.shippingAddress ? (
                                    <>
                                        <p style={{ margin: 0 }}>{order.shippingAddress.street}</p>
                                        <p style={{ margin: 0 }}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                        <p style={{ margin: 0 }}>{order.shippingAddress.country}</p>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ margin: 0 }}>123 Main Street</p>
                                        <p style={{ margin: 0 }}>Anytown, USA 12345</p>
                                    </>
                                )}
                            </div>
                            <div style={{ width: '45%' }}>
                                <h3 style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Payment Information</h3>
                                <p style={{ margin: '0.25rem 0' }}><strong>Payment Method:</strong> {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'bkash' ? 'bKash' : order.paymentMethod?.toUpperCase() || 'N/A'}</p>
                                {order.paymentStatus && (
                                    <p style={{ margin: '0.25rem 0', textTransform: 'capitalize' }}><strong>Payment Status:</strong> {order.paymentStatus}</p>
                                )}
                                <p style={{ margin: '0.25rem 0' }}><strong>Shipping Method:</strong> {order.shippingMethod?.title || 'Standard Shipping'}</p>
                            </div>
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
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                    <span>Shipping:</span>
                                    <span>${shipping.toFixed(2)}</span>
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
                    <Button variant="outline" onClick={handleReorder}><RefreshCw className="mr-2 h-4 w-4" /> Reorder</Button>
                    <Button onClick={handleDownloadInvoice}><Download className="mr-2 h-4 w-4" /> Download Invoice</Button>
                </div>
            </div>

            <div className="p-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Date: {formattedDate}</span>
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
                                            <Image
                                                src={item.image || 'https://placehold.co/64x64.png'}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="rounded-md"
                                            />
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
                                    {order.customerName}<br />
                                    {order.shippingAddress ? (
                                        <>
                                            {order.shippingAddress.street}<br />
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                            {order.shippingAddress.country}
                                        </>
                                    ) : (
                                        <>
                                            123 Main Street<br />
                                            Anytown, USA 12345
                                        </>
                                    )}
                                </address>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Payment Information</h3>
                                <div className="space-y-2 text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Payment Method:</span>
                                        <span className="font-medium text-foreground">
                                            {order.paymentMethod === 'bkash' ? (
                                                <Badge className="bg-pink-600">bKash</Badge>
                                            ) : order.paymentMethod === 'sslcommerz' ? (
                                                <Badge className="bg-blue-600">SSLCommerz</Badge>
                                            ) : order.paymentMethod === 'cod' ? (
                                                <Badge className="bg-green-600">COD</Badge>
                                            ) : order.paymentMethod === 'stripe' ? (
                                                <Badge className="bg-purple-600">Stripe</Badge>
                                            ) : order.paymentMethod === 'paypal' ? (
                                                <Badge className="bg-blue-500">PayPal</Badge>
                                            ) : order.paymentMethod === 'card' ? (
                                                <Badge variant="secondary">Card</Badge>
                                            ) : (
                                                'N/A'
                                            )}
                                        </span>
                                    </div>
                                    {order.paymentStatus && (
                                        <div className="flex justify-between">
                                            <span>Payment Status:</span>
                                            <span className="font-medium text-foreground capitalize">{order.paymentStatus}</span>
                                        </div>
                                    )}
                                    {order.paymentDetails?.bkash?.trxID && (
                                        <div className="flex justify-between">
                                            <span>Transaction ID:</span>
                                            <span className="font-mono text-xs">{order.paymentDetails.bkash.trxID}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Shipping Method:</span>
                                        <span className="font-medium text-foreground">
                                            {order.shippingMethod?.title || 'Standard Shipping'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
                                <div className="space-y-2 text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping {order.shippingMethod ? `(${order.shippingMethod.title})` : ''}:</span>
                                        <span>${shipping.toFixed(2)}</span>
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