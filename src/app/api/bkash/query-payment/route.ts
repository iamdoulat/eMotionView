import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BkashSettings } from '@/lib/placeholder-data';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { paymentID, token } = body;

        if (!paymentID || !token) {
            return NextResponse.json(
                { error: 'Missing required fields: paymentID, token' },
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

        // Query payment status
        const response = await fetch(`${baseURL}/tokenized/checkout/payment/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: token,
                'x-app-key': settings.appKey,
            },
            body: JSON.stringify({
                paymentID,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Bkash query payment failed:', data);
            return NextResponse.json(
                { error: 'Failed to query Bkash payment', details: data },
                { status: response.status }
            );
        }

        return NextResponse.json({
            paymentID: data.paymentID,
            mode: data.mode,
            paymentExecuteTime: data.paymentExecuteTime,
            paymentCreateTime: data.paymentCreateTime,
            trxID: data.trxID,
            transactionStatus: data.transactionStatus,
            amount: data.amount,
            currency: data.currency,
            intent: data.intent,
            merchantInvoiceNumber: data.merchantInvoiceNumber,
            payerReference: data.payerReference,
            customerMsisdn: data.customerMsisdn,
            statusCode: data.statusCode,
            statusMessage: data.statusMessage,
        });
    } catch (error) {
        console.error('Query payment error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
