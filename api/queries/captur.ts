"use server"
import { CapturModel } from "../models/captur-models";
import { getSuiClient } from "../sui-client";



export const fetchCapturInstance = async (): Promise<CapturModel | undefined> => {
    const client = getSuiClient();
    const capturObjectId = process.env.NEXT_PUBLIC_CAPTUR_OBJECT_ID;

    if (!capturObjectId) {
        console.error("Captur object ID is not defined in environment variables.");
        return undefined;
    }

    try {
        const response = await client.getObject({
            id: capturObjectId,
            options: {
                showContent: true
            }
        });
        if (response.data?.content?.dataType === "moveObject") {
            return response.data.content.fields as unknown as CapturModel;
        }
    }
    catch (error) {
        console.error("Error fetching captur object", error);
    }
    return undefined;
}