"use client";

import { useState, useEffect } from 'react';
import type { ShippingSettings, ShippingMethod } from '@/lib/placeholder-data';

export function useShipping(subtotal: number = 0) {
    const [methods, setMethods] = useState<ShippingMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);

    useEffect(() => {
        const fetchShipping = async () => {
            try {
                const res = await fetch('/api/data/admin_settings?id=shipping');
                if (res.ok) {
                    const data = await res.json();

                    let availableMethods = (data.methods || []).filter((m: ShippingMethod) => m.isEnabled);

                    availableMethods = availableMethods.filter((method: ShippingMethod) => {
                        if (method.type === 'free_shipping') {
                            return subtotal >= (method.minOrderAmount || 0);
                        }
                        return true;
                    });

                    setMethods(availableMethods);

                    const freeShippingMethod = availableMethods.find((m: ShippingMethod) =>
                        m.type === 'free_shipping' &&
                        subtotal >= (m.minOrderAmount || 0) &&
                        m.isEnabled
                    );

                    if (freeShippingMethod) {
                        if (selectedMethod?.id !== freeShippingMethod.id) {
                            setSelectedMethod(freeShippingMethod);
                        }
                    } else if (availableMethods.length > 0 && !selectedMethod) {
                        setSelectedMethod(availableMethods[0]);
                    }
                } else {
                    const defaultMethod: ShippingMethod = {
                        id: 'flat_rate',
                        type: 'flat_rate',
                        title: 'Flat Rate',
                        cost: 5.00,
                        isEnabled: true,
                        description: 'Standard shipping',
                    };
                    setMethods([defaultMethod]);
                    setSelectedMethod(defaultMethod);
                }
            } catch {
                const defaultMethod: ShippingMethod = {
                    id: 'flat_rate',
                    type: 'flat_rate',
                    title: 'Flat Rate',
                    cost: 5.00,
                    isEnabled: true,
                    description: 'Standard shipping',
                };
                setMethods([defaultMethod]);
                setSelectedMethod(defaultMethod);
            } finally {
                setIsLoading(false);
            }
        };
        fetchShipping();
    }, [subtotal]);

    const selectMethod = (methodId: string) => {
        const method = methods.find(m => m.id === methodId);
        if (method) {
            setSelectedMethod(method);
        }
    };

    return {
        methods,
        selectedMethod,
        selectMethod,
        isLoading,
        shippingCost: selectedMethod?.cost || 0,
    };
}
