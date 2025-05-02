"use server"
import { getSuiClient } from "@/api/sui-client";
import { getWalrusClient } from "../walrus-client";
import { BlobModel } from "../models/shared-models";

export const getOwnedBlobs = async (owner: string): Promise<BlobModel[]> => {
    const client = getSuiClient();
    const walrusClient = getWalrusClient();

    const blobType = await walrusClient.getBlobType();
    console.log("Blob Type: ", blobType);

    const response = await client.getOwnedObjects({
        owner,
        filter: {
            MatchAll: [
                { StructType: blobType },
            ]
        },
        options: { showType: true, showContent: true },
    });

    return response.data.map(x => {
        if (x.data?.content?.dataType === "moveObject") {
            return x.data.content.fields as unknown as BlobModel;
        }
        return undefined;
    })
    .filter((x): x is BlobModel => x !== undefined)
}