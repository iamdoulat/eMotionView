"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ShippingSettings, ShippingMethod } from '@/lib/placeholder-data';

/**
 * Custom hook to get available shipping methods based on cart subtotal
 * Subscribes to real-time updates of shipping settings
 */
export function useShipping(subtotal: number = 0) {
    const [methods, setMethods] = useState<ShippingMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);

    useEffect(() => {
        const shippingRef = doc(db, 'admin_settings', 'shipping');

        // Set up real-time listener for shipping settings changes
        const unsubscribe = onSnapshot(
            shippingRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data() as ShippingSettings;

                    // Filter to only show enabled methods
                    let availableMethods = (data.methods || []).filter(m => m.isEnabled);

                    // For free shipping, check if minimum order amount is met
                    availableMethods = availableMethods.filter(method => {
                        if (method.type === 'free_shipping') {
                            // Only show if minimum order amount is met
                            return subtotal >= (method.minOrderAmount || 0);
                        }
                        return true; // Show all other enabled methods
                    });

                    setMethods(availableMethods);

                    // Auto-select first available method if none selected
                    if (availableMethods.length > 0 && !selectedMethod) {
                        setSelectedMethod(availableMethods[0]);
                    }
                } else {
                    // Default shipping method if none configured
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
                setIsLoading(false);
            },
            (error) => {
                console.error('Error fetching shipping methods:', error);
                // Fallback to default method on error
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
                setIsLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [subtotal]); // Re-run when subtotal changes (for free shipping threshold)

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
