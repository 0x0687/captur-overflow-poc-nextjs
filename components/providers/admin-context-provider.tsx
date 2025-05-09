"use client"
import { ProcessingCapModel } from '@/api/models/captur-models';
import { fetchProcessingCap } from '@/api/queries/processing-cap';
import { useCurrentAccount } from '@mysten/dapp-kit';
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of our context
interface AdminContextType {
    isAdmin: boolean;
    processingCap: ProcessingCapModel | null;
}

// Create the context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider component
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [processingCap, setProcessingCap] = useState<ProcessingCapModel | null>(null);
    const account = useCurrentAccount();


    useEffect(() => {
        if (!account) return;

        fetchProcessingCap(account.address)
            .then(cap => {
                if (!cap) {
                    setProcessingCap(null);
                    setIsAdmin(false);
                    return;
                }
                else {
                    setProcessingCap(cap);
                    setIsAdmin(true);
                }
            })
            .catch(err => {
                console.error('Error fetching admin cap:', err);
                setProcessingCap(null);
                setIsAdmin(false);
            });

    }, [account]);

    return (
        <AdminContext.Provider value={{ isAdmin, processingCap }}>
            {children}
        </AdminContext.Provider>
    );
};

// Hook to consume the entire context
export const useAdminContext = (): AdminContextType => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdminContext must be used within an AdminProvider');
    }
    return context;
};

// Hook to get just the isAdmin flag
export const useIsAdmin = (): boolean => {
    const { isAdmin } = useAdminContext();
    return isAdmin;
};

// Hook to get the adminCap model
export const useProcessingCap = (): ProcessingCapModel | null => {
    const { processingCap } = useAdminContext();
    return processingCap;
};
