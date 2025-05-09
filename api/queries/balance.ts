"use server"
import { getSuiClient } from "@/api/sui-client";
import { COIN_TYPE } from "../constants";
import { CoinStruct } from "@mysten/sui/client";

export const fetchBalance = async (address: string) => {
    const client = getSuiClient();
    try {
        const response = await client.getBalance({
            owner: address,
            coinType: COIN_TYPE
        });
        return Number(response.totalBalance);
    }
    catch (error) {
        console.error("Error fetching balance", error);
    }
    return 0;
}



export const fetchCoins = async (address: string): Promise<CoinStruct[] | undefined> => {
    const client = getSuiClient();
    try {
        const response = await client.getCoins({
            owner: address,
            coinType: COIN_TYPE
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching balance", error);
    }
    return undefined;
}

