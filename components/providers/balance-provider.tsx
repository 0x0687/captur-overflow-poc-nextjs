"use client"
import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {fetchBalance, fetchCoins} from "@/api/queries/balance";
import {useCurrentAccount} from "@mysten/dapp-kit";
import { CoinStruct } from "@mysten/sui/client";

export interface BalanceProviderContext {
    balance: number | undefined;
    coins: CoinStruct[] | undefined;
    updateBalance: () => void;
}

export const BalanceContext = createContext<BalanceProviderContext | null>(null);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const account = useCurrentAccount();
    const [balance, setBalance] = useState<number | undefined>(undefined);
    const [coins, setCoins] = useState<CoinStruct[]>([]);

    const updateBalance = useCallback(async () => {
        if (!account) {
            setBalance(undefined);
            return;
        }
        const balance = await fetchBalance(account.address);
        setBalance(balance);
    }, [account])

    const updateCoins = useCallback(async () => {
        if (!account) {
            setCoins([]);
            return;
        }
        const coins = await fetchCoins(account.address);
        setCoins(coins || []);
    }, [account])

    useEffect(() => {
        updateBalance();
        updateCoins();
    }, [updateBalance, updateCoins]);
    
    return (
        <BalanceContext.Provider
            value={{
                balance: balance,
                updateBalance: updateBalance,
                coins: coins,
            }}
        >
            {children}
        </BalanceContext.Provider>
    );
};

export const useBalance = () => {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error('useBalance must be used within a BalanceProvider');
    }
    return context;
}
    