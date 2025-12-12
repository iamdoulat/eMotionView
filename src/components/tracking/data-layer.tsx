"use client";

import { createContext, useContext, useEffect, ReactNode } from 'react';

interface DataLayerContextType {
    push: (event: Record<string, any>) => void;
}

const DataLayerContext = createContext<DataLayerContextType | undefined>(undefined);

export function DataLayerProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Initialize dataLayer if it doesn't exist
        window.dataLayer = window.dataLayer || [];
    }, []);

    const push = (event: Record<string, any>) => {
        if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push(event);
        }
    };

    return (
        <DataLayerContext.Provider value={{ push }}>
            {children}
        </DataLayerContext.Provider>
    );
}

export function useDataLayer() {
    const context = useContext(DataLayerContext);
    if (!context) {
        throw new Error('useDataLayer must be used within DataLayerProvider');
    }
    return context;
}

// Extend window type for TypeScript
declare global {
    interface Window {
        dataLayer: Record<string, any>[];
    }
}
