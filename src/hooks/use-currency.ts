"use client";

import { useState, useEffect } from 'react';
import type { Currency, CurrencySettings } from '@/lib/placeholder-data';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';

export function useCurrency() {
    const [currency, setCurrency] = useState<Currency>('USD');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCurrency = async () => {
            try {
                const res = await fetch('/api/data/admin_settings?id=currency');
                if (res.ok) {
                    const data = await res.json();
                    setCurrency(data.currency || 'USD');
                }
            } catch {
                setCurrency('USD');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCurrency();
        const interval = setInterval(fetchCurrency, 10000);
        return () => clearInterval(interval);
    }, []);

    return {
        currency,
        isLoading,
        symbol: getCurrencySymbol(currency),
        formatPrice: (amount: number) => formatPrice(amount, currency),
    };
}
