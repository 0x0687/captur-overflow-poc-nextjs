"use server"
import { SubscriptionModel } from "../models/captur-models";
import { DynamicObjectValue } from "../models/shared-models";
import { getSuiClient } from "../sui-client";



export const fetchSubscription = async (subscriptionTableId: string, address: string): Promise<SubscriptionModel | undefined> => {
    const client = getSuiClient();
    // console.log(contextTableId);
    const response = await client.getDynamicFieldObject({
        parentId: subscriptionTableId,
        name: {
            type: "address",
            value: address
        }
    });

    if (response.data?.content?.dataType == "moveObject") {
        console.log(response.data.content.fields);
        const value = response.data.content.fields as unknown as DynamicObjectValue<SubscriptionModel>;
        return value.value.fields;
    }

    return undefined;
};