'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SessionKey } from '@mysten/seal';         // adjust import path to your SDK
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { currentPackageId } from '@/api/constants';

// Define the shape of our context
interface SessionContextProps {
    sessionKey: SessionKey | null;
    initializeSession: () => Promise<void>;
    initializing: boolean;
}

// Create the context with an undefined default
const SessionContext = createContext<SessionContextProps | undefined>(undefined);

// Provider component to wrap your app
export const SealSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sessionKey, setSessionKey] = useState<SessionKey | null>(null);
    const [initializing, setInitializing] = useState(false); // New state to track initialization
    const currentAccount = useCurrentAccount();
    const { mutate: signPersonalMessage } = useSignPersonalMessage();

    useEffect(() => {
        // Changing the account will reset the session key
        if (currentAccount) {
            setSessionKey(null); // Reset session key when account changes
        }
    }, [currentAccount]);

    const initializeSession =
        async () => {
            if (!currentAccount) {
                console.error('No current account found. Please connect your wallet.');
                return;
            }
            setInitializing(true); // Set initializing to true when starting the process
            // 1. Create the session key object
            const sk = new SessionKey({
                address: currentAccount.address,
                packageId: currentPackageId,
                ttlMin: 10,
            });

            // 2. Get the message that needs signing
            const message = sk.getPersonalMessage();

            // 3. Request the user to sign via their wallet
            if (!currentAccount) {
                throw new Error('No current account found. Please connect your wallet.');
            }
            signPersonalMessage(
                {
                    message: message,
                },
                {
                    onSuccess: (result) => {
                        sk.setPersonalMessageSignature(result.signature);
                        setSessionKey(sk);
                        setInitializing(false); // Set initializing to false after successful initialization
                    },
                    onError: (error) => {
                        console.error('Error signing message:', error);
                        setInitializing(false); // Set initializing to false on error
                    },
                },
            );

            // 4. Finalize session key initialization

        }

    return (
        <SessionContext.Provider value={{ sessionKey, initializeSession, initializing }}>
            {children}
        </SessionContext.Provider>
    );
};

// Hook to consume the session context
export const useSealSession = (): SessionContextProps => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
