"use server"
import { APPROVE_DATA_TARGET, currentPackageId, SUBMIT_DATA_TARGET, SUBSCRIBE_TARGET } from "@/api/constants";
import { publisherClient } from "@/api/publisher/publisher-client";
import { getSuiClient } from "@/api/sui-client";
import { toBase64 } from "@mysten/bcs";
import { getWalrusClient } from "@/api/walrus-client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { getSealClient } from "@/api/seal-client.";
import { fromHex, toHex } from '@mysten/sui/utils';

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

export async function encryptSessionUsingSeal(file: Blob): Promise<{
    encryptedObject: Uint8Array;
    key: Uint8Array;
}> {
    const sealClient = getSealClient();
    const nonce = crypto.getRandomValues(new Uint8Array(5));
    const fileBytes = await file.bytes();
    const id = toHex(new Uint8Array([...fileBytes, ...nonce]));
    return await sealClient.encrypt({
        threshold: 2,
        packageId: currentPackageId,
        id,
        data: fileBytes
    });
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

export async function buildSubscribeTransaction(sender: string, capturInstanceId: string, price: number, coinIds: string[]) {
    const tx = new Transaction();

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

    tx.moveCall({
        target: SUBSCRIBE_TARGET,
        arguments: [
            tx.object(capturInstanceId),
            paymentCoin
        ],
    });

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}