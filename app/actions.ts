"use server"
import { getSuiClient } from "@/api/sui-client";
import { getWalrusClient } from "@/api/walrus-client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

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
export async function uploadSessionAction(file: Blob): Promise<string> {
    // convert Browser Blob/File to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const blobBytes = new Uint8Array(arrayBuffer);

    // ensure key is present
    if (!process.env.WALRUS_KEYPAIR) {
        throw new Error('WALRUS_KEYPAIR not set on server');
    }
    const keypair = Ed25519Keypair.fromSecretKey(process.env.WALRUS_KEYPAIR);

    const walrusClient = getWalrusClient();

    const { blobId } = await walrusClient.writeBlob({
        blob: blobBytes,
        deletable: false,
        epochs: 1,
        signer: keypair,
    });

    return blobId;
}