"use server"
import { SUBSCRIPTION_TYPE } from "../constants";
import { SubscriptionModel } from "../models/captur-models";
import { getSuiClient } from "../sui-client";


export const fetchSubscription = async (owner: string): Promise<SubscriptionModel | null> => {
    const client = getSuiClient();

    const response = await client.getOwnedObjects({
        owner: owner,
        filter: {
            MatchAny: [
                {
                    StructType: SUBSCRIPTION_TYPE
                }
            ],
        },
        options: {
            showContent: true
        },
        limit: 1
    });
    const sub = response.data.map(x => {
        if (x.data?.content?.dataType === "moveObject") {
            return x.data.content.fields as unknown as SubscriptionModel;
        }
        return undefined;
    })
    .filter((cap): cap is SubscriptionModel => cap !== undefined);

    if (sub.length > 0) {
        return sub[0];
    }
    return null;
};