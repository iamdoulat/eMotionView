import type { Currency } from './placeholder-data';

export const currencySymbols: Record<Currency, string> = {
    USD: '$',
    CAD: 'C$',
    BDT: '৳',
};

export const currencyNames: Record<Currency, string> = {
    USD: 'US Dollar',
    CAD: 'Canadian Dollar',
    BDT: 'Bangladeshi Taka',
};

/**
 * Format a price with the appropriate currency symbol
 * @param amount - The numeric amount
 * @param currency - The currency code (USD, CAD, BDT)
 * @returns Formatted price string with currency symbol
 */
export function formatPrice(amount: number, currency: Currency = 'USD'): string {
    const symbol = currencySymbols[currency];

    // Format number with 2 decimal places
    const formatted = amount.toFixed(2);

    // For BDT, symbol goes after the amount
    if (currency === 'BDT') {
        return `${formatted}${symbol}`;
    }

    // For USD and CAD, symbol goes before
    return `${symbol}${formatted}`;
}

/**
 * Get just the currency symbol
 */
export function getCurrencySymbol(currency: Currency = 'USD'): string {
    return currencySymbols[currency];
}
