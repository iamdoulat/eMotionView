import { NextRequest, NextResponse } from 'next/server';
import { findMany } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!orderNumber || !email) {
      return NextResponse.json({ error: 'Order number and email are required.' }, { status: 400 });
    }

    const matches = await findMany('orders', { orderNumber } as any);
    const order = matches.find(
      (o: any) => typeof o.customerEmail === 'string' && o.customerEmail.trim().toLowerCase() === email
    );

    if (!order) {
      return NextResponse.json({ error: 'No order found with that number and email combination.' }, { status: 404 });
    }

    return NextResponse.json({
      id: order.orderNumber || order._id?.toString(),
      orderNumber: order.orderNumber,
      date: order.date,
      status: order.status,
      total: order.total,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingMethod: order.shippingMethod,
      items: Array.isArray(order.items) ? order.items : [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not search orders.' }, { status: 500 });
  }
}
