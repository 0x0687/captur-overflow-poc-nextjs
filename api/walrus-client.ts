import { WalrusClient } from '@mysten/walrus';
import type { RequestInfo, RequestInit } from 'undici';
import { Agent, fetch } from 'undici';
import { getClientSuiClient, getSuiClient } from './sui-client';

export const getWalrusClient = () => {
    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';
    const suiClient = getSuiClient();

    if (network === 'localnet' || network === 'devnet') {
        throw new Error('WalrusClient is not supported on ' + network + ' network');
    }

    return new WalrusClient({
        network: network,
        suiClient,
        storageNodeClientOptions: {
            timeout: 60_000,
            fetch: (url, init) => {
                // Some casting may be required because undici types may not exactly match the @node/types types
                return fetch(url as RequestInfo, {
                    ...(init as RequestInit),
                    dispatcher: new Agent({
                        connectTimeout: 60_000,
                    }),
                }) as unknown as Promise<Response>;
            },
        },
    });
}

export const getClientWalrusClient = () => {
    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';
    const suiClient = getClientSuiClient();

    if (network === 'localnet' || network === 'devnet') {
        throw new Error('WalrusClient is not supported on ' + network + ' network');
    }

    return new WalrusClient({
        network: network,
        suiClient
    });
}