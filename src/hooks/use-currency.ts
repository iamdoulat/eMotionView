"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Currency, CurrencySettings } from '@/lib/placeholder-data';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';

/**
 * Custom hook to get the current currency setting from admin
 * Subscribes to real-time updates of currency changes
 */
export function useCurrency() {
    const [currency, setCurrency] = useState<Currency>('USD');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currencyRef = doc(db, 'admin_settings', 'currency');

        // Set up real-time listener for currency changes
        const unsubscribe = onSnapshot(
            currencyRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data() as CurrencySettings;
                    setCurrency(data.currency || 'USD');
                } else {
                    setCurrency('USD');
                }
                setIsLoading(false);
            },
            (error) => {
                console.error('Error fetching currency:', error);
                setCurrency('USD'); // Fallback to USD on error
                setIsLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return {
        currency,
        isLoading,
        symbol: getCurrencySymbol(currency),
        formatPrice: (amount: number) => formatPrice(amount, currency),
    };
}
