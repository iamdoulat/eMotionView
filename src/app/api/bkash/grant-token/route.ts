import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BkashSettings } from '@/lib/placeholder-data';

export async function POST(request: NextRequest) {
    try {
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

        if (!settings.isEnabled) {
            return NextResponse.json(
                { error: 'Bkash payment is not enabled' },
                { status: 400 }
            );
        }

        const baseURL = settings.isSandbox
            ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
            : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

        // Request grant token from Bkash
        const response = await fetch(`${baseURL}/tokenized/checkout/token/grant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                username: settings.username,
                password: settings.password,
            },
            body: JSON.stringify({
                app_key: settings.appKey,
                app_secret: settings.appSecret,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Bkash token grant failed:', data);
            return NextResponse.json(
                { error: 'Failed to obtain Bkash token', details: data },
                { status: response.status }
            );
        }

        return NextResponse.json({
            token: data.id_token,
            expiresIn: data.expires_in,
            refreshToken: data.refresh_token,
        });
    } catch (error) {
        console.error('Grant token error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
