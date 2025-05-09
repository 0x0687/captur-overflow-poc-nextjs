"use server"
import {getSuiClient} from "@/api/sui-client";
import { getWalrusClient } from "../walrus-client";

export const getCurrentEpoch = async (): Promise<number> => {
    const client = getSuiClient();

    const response = await client.getLatestSuiSystemState();
    return Number(response.epoch);
}

export const getCurrentWalrusEpoch = async (): Promise<number> => {
    const client = getWalrusClient();
    const systemState = await client.systemState();
    

    return Number(systemState.committee.epoch);
}