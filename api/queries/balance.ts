"use server"
import {getSuiClient} from "@/api/sui-client";

export const fetchBalance = async (address: string) => {
    const client = getSuiClient();
    try {
        const response = await client.getBalance({
            owner: address,
            coinType: "0x2::sui::SUI"
        });
        return Number(response.totalBalance);
    }
    catch (error) {
        console.error("Error fetching balance", error);
    }
    return 0;
}