import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SSLCommerzSettings } from '@/lib/placeholder-data';
const SSLCommerzPayment = require('sslcommerz-lts');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { val_id } = body;

        if (!val_id) {
            return NextResponse.json(
                { error: 'Missing required field: val_id' },
                { status: 400 }
            );
        }

        // Fetch SSLCommerz settings from Firestore
        const settingsRef = doc(db, 'admin_settings', 'sslcommerz_payment');
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
            return NextResponse.json(
                { error: 'SSLCommerz settings not configured' },
                { status: 400 }
            );
        }

        const settings = settingsSnap.data() as SSLCommerzSettings;

        // Initialize SSLCommerz
        const sslcz = new SSLCommerzPayment(
            settings.storeId,
            settings.storePassword,
            !settings.isSandbox
        );

        // Validate payment
        const validationResponse = await sslcz.validate({ val_id });

        if (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED') {
            return NextResponse.json({
                status: validationResponse.status,
                tran_id: validationResponse.tran_id,
                val_id: validationResponse.val_id,
                amount: validationResponse.amount,
                card_type: validationResponse.card_type,
                store_amount: validationResponse.store_amount,
                card_no: validationResponse.card_no,
                bank_tran_id: validationResponse.bank_tran_id,
                tran_date: validationResponse.tran_date,
                currency: validationResponse.currency,
                card_issuer: validationResponse.card_issuer,
                card_brand: validationResponse.card_brand,
                card_issuer_country: validationResponse.card_issuer_country,
                verify_sign: validationResponse.verify_sign,
                verify_key: validationResponse.verify_key,
                risk_level: validationResponse.risk_level,
                risk_title: validationResponse.risk_title,
            });
        } else {
            return NextResponse.json(
                { error: 'Payment validation failed', details: validationResponse },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('SSLCommerz validation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
