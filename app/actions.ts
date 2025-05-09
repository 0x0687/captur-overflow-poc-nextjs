"use server"
import { APPROVE_DATA_TARGET, currentPackageId, EXTEND_SUBSCRIPTION_TARGET, NEW_SUBSCRIPTION_TARGET, SUBMIT_DATA_TARGET, SUBSCRIPTION_SEAL_APPROVE_TARGET, VERIFIER_SEAL_APPROVE_TARGET } from "@/api/constants";
import { publisherClient } from "@/api/publisher/publisher-client";
import { getSuiClient } from "@/api/sui-client";
import { toBase64 } from "@mysten/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { getSealClient } from "@/api/seal-client.";
import { toHex } from '@mysten/sui/utils';
import { EncryptedObject } from "@mysten/seal";

export async function executeTransactionBlock(bytes: string, signature: string) {
    const client = getSuiClient();
    return await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
            showRawEffects: true,
            showObjectChanges: true,
        },
    });
}

export async function executeAndWaitForTransactionBlock(bytes: string, signature: string) {
    const client = getSuiClient();
    const response = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
            showRawEffects: true,
            showObjectChanges: true,
        },
    });
    await client.waitForTransaction({
        digest: response.digest
    });
    return response;
}

export async function waitForTransaction(digest: string) {
    const client = getSuiClient();
    return await client.waitForTransaction({
        digest
    });
}


/**
 * Takes a File or Blob, writes it to Walrus, and returns the new blobId.
 */
export async function uploadSessionAction(file: Blob, owner: string): Promise<string | undefined> {


    const response = await publisherClient.routes.putBlob(
        {
            epochs: 1,
            sendObjectTo: owner,
            requestBody: file,
        }
    );

    if ("alreadyCertified" in response) {
        return undefined;
    }
    if ("newlyCreated" in response) {
        return response.newlyCreated.blobObject.id;
    }
    if ("markedInvalid" in response) {
        throw new Error("Blob marked invalid");
    }
    if ("error" in response) {
        throw new Error("Error uploading blob: " + response.error.error_msg);
    }
    throw new Error("Unknown error uploading blob");
}

/**
 * Takes an encrypted session, writes it to Walrus, and returns the new blobId.
 */
export async function uploadEncryptedSessionAction(encryptedBytes: Uint8Array, owner: string): Promise<string | undefined> {

    // Verify the encrypted object
    const encryptedObject = EncryptedObject.parse(encryptedBytes);
    if (encryptedObject.packageId !== currentPackageId) {
        throw new Error("Encrypted object package ID does not match");
    }

    const response = await publisherClient.routes.putBlob(
        {
            epochs: 1,
            sendObjectTo: owner,
            requestBody: new Blob([encryptedBytes]),
        }
    );

    if ("alreadyCertified" in response) {
        return undefined;
    }
    if ("newlyCreated" in response) {
        return response.newlyCreated.blobObject.id;
    }
    if ("markedInvalid" in response) {
        throw new Error("Blob marked invalid");
    }
    if ("error" in response) {
        throw new Error("Error uploading blob: " + response.error.error_msg);
    }
    throw new Error("Unknown error uploading blob");
}

export async function encryptSessionUsingSeal(file: Blob): Promise<{
    encryptedObject: Uint8Array;
    key: Uint8Array;
}> {
    const sealClient = getSealClient();
    const nonce = crypto.getRandomValues(new Uint8Array(16));
    const fileBytes = await file.bytes();
    const id = toHex(nonce);
    return await sealClient.encrypt({
        threshold: 2,
        packageId: currentPackageId,
        id,
        data: fileBytes
    });
}

export async function buildDecryptUnprocessedBlobUsingSealTx(sealId: Uint8Array, processingCapId: string, dataPointId: string){
    const suiClient = getSuiClient();
    // Create the Transaction for evaluating the seal_approve function.
    const tx = new Transaction();
    tx.moveCall({
        target: VERIFIER_SEAL_APPROVE_TARGET,
        arguments: [
            tx.pure.vector("u8", sealId),
            tx.object(processingCapId),
            tx.object(dataPointId),
        ]
    });
    return await tx.build({ client: suiClient, onlyTransactionKind: true })
}

export async function buildDecryptProcessedBlobUsingSealTx(sealId: Uint8Array, subscriptionId: string, dataPointId: string){
    const suiClient = getSuiClient();
    // Create the Transaction for evaluating the seal_approve function.
    const tx = new Transaction();
    tx.moveCall({
        target: SUBSCRIPTION_SEAL_APPROVE_TARGET,
        arguments: [
            tx.pure.vector("u8", sealId),
            tx.object(subscriptionId),
            tx.object(dataPointId),
        ]
    });
    return await tx.build({ client: suiClient, onlyTransactionKind: true })
}

export async function buildSubmitDataTransaction(sender: string, blobId: string, age_range: string, gender: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: SUBMIT_DATA_TARGET,
        arguments: [
            tx.object(blobId),
            tx.pure.string(age_range),
            tx.pure.string(gender)
        ],
    });

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildApproveDataTransaction(sender: string, capturInstanceId: string, processingCapId: string, dataPointId: string, value: number) {
    const tx = new Transaction();
    tx.moveCall({
        target: APPROVE_DATA_TARGET,
        arguments: [
            tx.object(capturInstanceId),
            tx.object(processingCapId),
            tx.object(dataPointId),
            tx.pure.u64(value)
        ],
    });

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildNewSubscribeTransaction(sender: string, capturInstanceId: string, price: number, coinIds: string[]) {
    const tx = new Transaction();

    // Smash the coins if necessary
    if (coinIds.length < 1) {
        throw new Error("No coins provided");
    }
    if (coinIds.length > 1) {
        tx.mergeCoins(
            tx.object(coinIds[0]),
            // List of all the other coins
            coinIds.slice(1).map((coinId) => tx.object(coinId)),
        );
    }
    const [paymentCoin] = tx.splitCoins(coinIds[0], [tx.pure.u64(price)]);

    // Create the subscription object
    const [subscription] = tx.moveCall({
        target: NEW_SUBSCRIPTION_TARGET,
        arguments: []
    })

    // Extend the subscription with the payment
    tx.moveCall({
        target: EXTEND_SUBSCRIPTION_TARGET,
        arguments: [
            tx.object(capturInstanceId),
            subscription,
            paymentCoin
        ],
    });

    // Transfer the subscription object to the sender
    tx.transferObjects([subscription], sender);

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildExtendSubscriptionTransaction(sender: string, capturInstanceId: string, subscriptionId: string, price: number, coinIds: string[]) {
    const tx = new Transaction();

    // Smash the coins if necessary
    if (coinIds.length < 1) {
        throw new Error("No coins provided");
    }
    if (coinIds.length > 1) {
        tx.mergeCoins(
            tx.object(coinIds[0]),
            // List of all the other coins
            coinIds.slice(1).map((coinId) => tx.object(coinId)),
        );
    }
    const [paymentCoin] = tx.splitCoins(coinIds[0], [tx.pure.u64(price)]);


    // Extend the subscription with the payment
    tx.moveCall({
        target: EXTEND_SUBSCRIPTION_TARGET,
        arguments: [
            tx.object(capturInstanceId),
            tx.object(subscriptionId),
            paymentCoin
        ],
    });

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}