import {SuiGraphQLClient} from '@mysten/sui/graphql';
import {getFullnodeUrl, SuiClient} from "@mysten/sui/client";
import {createSuiClient} from "@shinami/clients/sui";

let gqlClient: SuiGraphQLClient | null = null;

export const getGraphQLClient = (): SuiGraphQLClient => {
    if (!gqlClient) {
        gqlClient = new SuiGraphQLClient({
            url: 'http://127.0.0.1:9125', // Replace with your actual endpoint
        });
    }
    return gqlClient;
};

export const getSuiClient = () => {
    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';

    let client;

    if (network == "localnet") {
        client = new SuiClient({
            url: getFullnodeUrl(network)
        });
    }
    else {
        const shinamiKey = process.env.SHINAMI_NODE_KEY;
        if (!shinamiKey){
            throw new Error("SHINAMI_NODE_KEY is not set");
        }
        client = createSuiClient(shinamiKey);
    }
    return client;
}

export const getClientSuiClient = () => {
    const network = process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet';
    return new SuiClient({
        url: getFullnodeUrl(network)
    });
}