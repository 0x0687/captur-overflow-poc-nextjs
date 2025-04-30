import { WalrusClient } from '@mysten/walrus';
import { getSuiClient } from './sui-client';

export const getWalrusClient = () => {
    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';
    const suiClient = getSuiClient();

    if (network === 'localnet' || network === 'devnet') {
        throw new Error('WalrusClient is not supported on ' + network + ' network');
    }
    
    return new WalrusClient({
        network: network,
        suiClient,
    });
}