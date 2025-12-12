import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BkashSettings } from '@/lib/placeholder-data';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, orderId, token } = body;

        if (!amount || !orderId || !token) {
            return NextResponse.json(
                { error: 'Missing required fields: amount, orderId, token' },
                { status: 400 }
            );
        }

        // Fetch Bkash settings from Firestore
        const settingsRef = doc(db, 'admin_settings', 'bkash_payment');
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
            return NextResponse.json(
                { error: 'Bkash settings not configured' },
                { status: 400 }
            );
        }

        const settings = settingsSnap.data() as BkashSettings;

        const baseURL = settings.isSandbox
            ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
            : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

        // Create payment request
        const response = await fetch(`${baseURL}/tokenized/checkout/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: token,
                'x-app-key': settings.appKey,
            },
            body: JSON.stringify({
                mode: '0011',
                payerReference: orderId,
                callbackURL: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/callback`,
                amount: amount.toString(),
                currency: 'BDT',
                intent: 'sale',
                merchantInvoiceNumber: orderId,
            }),
        });

        const data = await response.json();

        if (!response.ok || data.statusCode !== '0000') {
            console.error('Bkash create payment failed:', data);
            return NextResponse.json(
                { error: 'Failed to create Bkash payment', details: data },
                { status: response.status }
            );
        }

        return NextResponse.json({
            paymentID: data.paymentID,
            bkashURL: data.bkashURL,
            callbackURL: data.callbackURL,
            successCallbackURL: data.successCallbackURL,
            failureCallbackURL: data.failureCallbackURL,
            cancelledCallbackURL: data.cancelledCallbackURL,
            amount: data.amount,
            intent: data.intent,
            currency: data.currency,
            paymentCreateTime: data.paymentCreateTime,
            transactionStatus: data.transactionStatus,
            merchantInvoiceNumber: data.merchantInvoiceNumber,
        });
    } catch (error) {
        console.error('Create payment error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
