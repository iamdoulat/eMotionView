import type { Currency } from './placeholder-data';

export const currencies: Currency[] = ['USD', 'CAD', 'BDT', 'QAR', 'AED', 'SAR'];

export const currencySymbols: Record<Currency, string> = {
    USD: '$',
    CAD: 'C$',
    BDT: '৳',
    QAR: 'QR',
    AED: 'AED',
    SAR: 'SAR',
};

export const currencyNames: Record<Currency, string> = {
    USD: 'US Dollar',
    CAD: 'Canadian Dollar',
    BDT: 'Bangladeshi Taka',
    QAR: 'Qatari Riyal',
    AED: 'UAE Dirham',
    SAR: 'Saudi Riyal',
};

export const currencyFlags: Record<Currency, string> = {
    USD: '🇺🇸',
    CAD: '🇨🇦',
    BDT: '🇧🇩',
    QAR: '🇶🇦',
    AED: '🇦🇪',
    SAR: '🇸🇦',
};

/**
 * Format a price with the appropriate currency symbol
 * @param amount - The numeric amount
 * @param currency - The currency code (USD, CAD, BDT, QAR, AED, SAR)
 * @returns Formatted price string with currency symbol
 */
export function formatPrice(amount: number, currency: Currency = 'USD'): string {
    const symbol = currencySymbols[currency] || '$';

    // Format number with 2 decimal places
    const formatted = (amount || 0).toFixed(2);

    // For BDT, symbol goes after the amount
    if (currency === 'BDT') {
        return `${formatted}${symbol}`;
    }

    // For Middle Eastern currencies, symbol with space goes before
    if (currency === 'QAR' || currency === 'AED' || currency === 'SAR') {
        return `${symbol} ${formatted}`;
    }

    // For USD and CAD, symbol goes directly before
    return `${symbol}${formatted}`;
}

/**
 * Get just the currency symbol
 */
export function getCurrencySymbol(currency: Currency = 'USD'): string {
    return currencySymbols[currency] || '$';
}
