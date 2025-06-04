import { getClientSuiClient, getSuiClient } from './sui-client';
import { getAllowlistedKeyServers, SealClient } from '@mysten/seal';

export const getSealClient = () => {
    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';
    const suiClient = getSuiClient();

    if (network === 'localnet' || network === 'devnet') {
        throw new Error('WalrusClient is not supported on ' + network + ' network');
    }

    return new SealClient({
        suiClient,
        serverConfigs: getAllowlistedKeyServers(network).map((server) => ({
            objectId: server,
            weight: 1,
        })),
        verifyKeyServers: false,
    })
}

export const getClientSealClient = () => {
    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';
    const suiClient = getClientSuiClient();

    if (network === 'localnet' || network === 'devnet') {
        throw new Error('WalrusClient is not supported on ' + network + ' network');
    }

    return new SealClient({
        suiClient,
        serverConfigs: getAllowlistedKeyServers(network).map((server) => ({
            objectId: server,
            weight: 1,
        })),
        verifyKeyServers: false,
    });
}