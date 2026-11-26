"use client";

import { useState, useEffect } from 'react';
import type { Currency } from '@/lib/placeholder-data';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';

const CACHE_KEY = 'eMV_currency';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Module-level singleton state shared across all useCurrency instances
let globalCurrency: Currency = 'BDT';
let isInitialized = false;
let inflightPromise: Promise<Currency> | null = null;
const listeners = new Set<(c: Currency) => void>();

function notify(c: Currency) {
    globalCurrency = c;
    listeners.forEach(fn => fn(c));
}

async function loadCurrency(): Promise<Currency> {
    if (isInitialized) return globalCurrency;
    if (inflightPromise) return inflightPromise;

    // Check localStorage first
    if (typeof window !== 'undefined') {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { value, ts } = JSON.parse(cached);
                if (Date.now() - ts < CACHE_TTL) {
                    isInitialized = true;
                    globalCurrency = value as Currency;
                    notify(globalCurrency);
                    return globalCurrency;
                }
            }
        } catch { }
    }

    // Single in-flight request for all mounting components
    inflightPromise = (async () => {
        try {
            const res = await fetch('/api/data/admin_settings?id=currency');
            if (res.ok) {
                const data = await res.json();
                const val = (data.currency || 'BDT') as Currency;
                isInitialized = true;
                notify(val);
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({ value: val, ts: Date.now() }));
                } catch { }
                return val;
            }
        } catch { }
        isInitialized = true;
        notify('BDT');
        return 'BDT';
    })().finally(() => {
        inflightPromise = null;
    });

    return inflightPromise;
}

export function useCurrency() {
    const [currency, setCurrency] = useState<Currency>(() => {
        if (isInitialized) return globalCurrency;
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { value, ts } = JSON.parse(cached);
                    if (Date.now() - ts < CACHE_TTL) {
                        isInitialized = true;
                        globalCurrency = value as Currency;
                        return value as Currency;
                    }
                }
            } catch { }
        }
        return globalCurrency;
    });
    const [isLoading, setIsLoading] = useState(!isInitialized);

    useEffect(() => {
        const handler = (newCurrency: Currency) => {
            setCurrency(newCurrency);
            setIsLoading(false);
        };
        listeners.add(handler);

        // Fetch once across the whole page lifecycle
        loadCurrency().then((val) => {
            setCurrency(val);
            setIsLoading(false);
        });

        return () => {
            listeners.delete(handler);
        };
    }, []);

    return {
        currency,
        isLoading,
        symbol: getCurrencySymbol(currency),
        formatPrice: (amount: number) => formatPrice(amount, currency),
    };
}
