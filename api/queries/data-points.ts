"use server"
import { getSuiClient } from "@/api/sui-client";
import { APPROVE_DATA_FUNCTION, SUBMIT_BLOB_EVENT_TYPE, SUBMIT_DATA_FUNCTION, PROCESS_DATA_EVENT_TYPE } from "../constants";
import { DataProcessedEventModel, DataPointModel } from "../models/captur-models";

export interface BlobSubmissionDto {
    digest: string;
    timestamp: Date;
    event: DataProcessedEventModel;
}

export const getRecentlyProcessedDataPoints = async (): Promise<BlobSubmissionDto[]> => {
    const client = getSuiClient();
    const response = await client.queryTransactionBlocks({
        limit: 25,
        order: "descending",
        filter: {
            MoveFunction: APPROVE_DATA_FUNCTION
        },
        options: {
            showEvents: true,
        }
    });

    const recentInteractions = response.data.map(x => {
        const event = x.events?.find(ev => ev.type == PROCESS_DATA_EVENT_TYPE) ?? undefined;
        if (event) {
            return {
                digest: x.digest as string,
                timestamp: x.timestampMs ? new Date(Number(x.timestampMs)) : new Date(),
                event: event.parsedJson as DataProcessedEventModel
            }
        }
        return undefined;
    })
        .filter((interact): interact is BlobSubmissionDto => interact !== undefined);


    return recentInteractions;
}

export const getRecentlyAddedDataPoints = async (
): Promise<BlobSubmissionDto[]> => {
    const client = getSuiClient();
    const response = await client.queryTransactionBlocks({
        limit: 25,
        order: "descending",
        filter: {
            MoveFunction: SUBMIT_DATA_FUNCTION
        },
        options: {
            showEvents: true,
        }
    });

    const recentInteractions = response.data.map(x => {
        const event = x.events?.find(ev => ev.type == SUBMIT_BLOB_EVENT_TYPE) ?? undefined;
        if (event) {
            return {
                digest: x.digest as string,
                timestamp: x.timestampMs ? new Date(Number(x.timestampMs)) : new Date(),
                event: event.parsedJson as DataProcessedEventModel
            }
        }
        return undefined;
    })
        .filter((interact): interact is BlobSubmissionDto => interact !== undefined);


    return recentInteractions;
}

export const fetchDataPoint = async (dataPointId: string): Promise<DataPointModel | undefined> => {
    const client = getSuiClient();

    try {
        const response = await client.getObject({
            id: dataPointId,
            options: {
                showContent: true
            }
        });
        if (response.data?.content?.dataType === "moveObject") {
            return response.data.content.fields as unknown as DataPointModel;
        }
    }
    catch (error) {
        console.error("Error fetching data point", error);
    }
    return undefined;
}

export const fetchDataPointsByIds = async (dataPointIds: string[]): Promise<DataPointModel[]> => {
    const client = getSuiClient();
    const response = await client.multiGetObjects({
        ids: dataPointIds,
        options: {
            showContent: true
        }
    });

    const houses = response.map(x => {
        if (x.data?.content?.dataType === "moveObject") {
            return x.data.content.fields as unknown as DataPointModel;
        }
        return undefined;
    })
        .filter((house): house is DataPointModel => house !== undefined);

    return houses;
}