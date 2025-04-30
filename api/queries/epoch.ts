"use server"
import {getSuiClient} from "@/api/sui-client";

export const getCurrentEpoch = async (): Promise<number> => {
    const client = getSuiClient();

    const response = await client.getLatestSuiSystemState();
    return Number(response.epoch);
}