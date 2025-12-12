import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SSLCommerzSettings } from '@/lib/placeholder-data';
const SSLCommerzPayment = require('sslcommerz-lts');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, tranId, customerData, shippingAddress, cart } = body;

        if (!amount || !tranId) {
            return NextResponse.json(
                { error: 'Missing required fields: amount, tranId' },
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

        if (!settings.isEnabled) {
            return NextResponse.json(
                { error: 'SSLCommerz payment is not enabled' },
                { status: 400 }
            );
        }

        // Prepare SSLCommerz payment data
        const data = {
            total_amount: amount,
            currency: 'BDT',
            tran_id: tranId,
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/sslcommerz/success`,
            fail_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/sslcommerz/fail`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/sslcommerz/cancel`,
            ipn_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sslcommerz/ipn`,
            shipping_method: 'Courier',
            product_name: cart && cart.length > 0 ? cart[0].name : 'Products',
            product_category: 'general',
            product_profile: 'physical-goods',
            cus_name: customerData.name || 'Customer',
            cus_email: customerData.email || 'customer@example.com',
            cus_add1: shippingAddress?.address || 'N/A',
            cus_add2: shippingAddress?.city || 'N/A',
            cus_city: shippingAddress?.city || 'Dhaka',
            cus_state: shippingAddress?.state || 'Dhaka',
            cus_postcode: shippingAddress?.zipCode || '1000',
            cus_country: shippingAddress?.country || 'Bangladesh',
            cus_phone: customerData.phone || '01700000000',
            cus_fax: customerData.phone || '01700000000',
            ship_name: customerData.name || 'Customer',
            ship_add1: shippingAddress?.address || 'N/A',
            ship_add2: shippingAddress?.city || 'N/A',
            ship_city: shippingAddress?.city || 'Dhaka',
            ship_state: shippingAddress?.state || 'Dhaka',
            ship_postcode: shippingAddress?.zipCode || 1000,
            ship_country: shippingAddress?.country || 'Bangladesh',
        };

        // Initialize SSLCommerz
        const sslcz = new SSLCommerzPayment(
            settings.storeId,
            settings.storePassword,
            !settings.isSandbox // is_live parameter
        );

        // Initialize payment
        const apiResponse = await sslcz.init(data);

        if (apiResponse.status === 'SUCCESS') {
            return NextResponse.json({
                GatewayPageURL: apiResponse.GatewayPageURL,
                status: apiResponse.status,
                sessionkey: apiResponse.sessionkey,
                storeBanner: apiResponse.storeBanner,
                storeLogo: apiResponse.storeLogo,
            });
        } else {
            return NextResponse.json(
                { error: 'Payment initialization failed', details: apiResponse },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('SSLCommerz payment initialization error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
