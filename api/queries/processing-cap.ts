"use server"
import { getSuiClient } from "@/api/sui-client";
import { PROCESSING_CAP_TYPE } from "../constants";
import { ProcessingCapModel } from "../models/captur-models";


export const fetchProcessingCap = async (owner: string): Promise<ProcessingCapModel | null> => {
    const client = getSuiClient();

    const response = await client.getOwnedObjects({
        owner: owner,
        filter: {
            MatchAny: [
                {
                    StructType: PROCESSING_CAP_TYPE
                }
            ],
        },
        options: {
            showContent: true
        },
        limit: 1
    });
    const cap = response.data.map(x => {
        if (x.data?.content?.dataType === "moveObject") {
            return x.data.content.fields as unknown as ProcessingCapModel;
        }
        return undefined;
    })
    .filter((cap): cap is ProcessingCapModel => cap !== undefined);

    if (cap.length > 0) {
        return cap[0];
    }
    return null;
}