"use server"
import { publisherClient } from "@/api/publisher/publisher-client";
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
 * Takes a File or Blob, writes it to Walrus, and returns the new blobId.
 */
export async function uploadSessionDetailedAction(file: Blob): Promise<string> {
    // convert Browser Blob/File to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const blobBytes = new Uint8Array(arrayBuffer);

    // ensure key is present
    if (!process.env.WALRUS_KEYPAIR) {
        throw new Error('WALRUS_KEYPAIR not set on server');
    }
    const keypair = Ed25519Keypair.fromSecretKey(process.env.WALRUS_KEYPAIR);

    const walrusClient = getWalrusClient();
    const suiClient = getSuiClient();

    const encoded = await walrusClient.encodeBlob(blobBytes);

    const registerBlobTransaction = await walrusClient.registerBlobTransaction({
        blobId: encoded.blobId,
        rootHash: encoded.rootHash,
        size: blobBytes.length,
        deletable: true,
        epochs: 1,
        owner: keypair.toSuiAddress(),
    });

    const { digest } = await suiClient.signAndExecuteTransaction({
        transaction: registerBlobTransaction,
        signer: keypair,
    });

    const { objectChanges, effects } = await suiClient.waitForTransaction({
        digest,
        options: { showObjectChanges: true, showEffects: true },
    });

    if (effects?.status.status !== 'success') {
        throw new Error('Failed to register blob');
    }

    const blobType = await walrusClient.getBlobType();

    const blobObject = objectChanges?.find(
        (change) => change.type === 'created' && change.objectType === blobType,
    );

    if (!blobObject || blobObject.type !== 'created') {
        throw new Error('Blob object not found');
    }

    const confirmations = await walrusClient.writeEncodedBlobToNodes({
        blobId: encoded.blobId,
        metadata: encoded.metadata,
        sliversByNode: encoded.sliversByNode,
        deletable: true,
        objectId: blobObject.objectId,
    });

    const certifyBlobTransaction = await walrusClient.certifyBlobTransaction({
        blobId: encoded.blobId,
        blobObjectId: blobObject.objectId,
        confirmations,
        deletable: true,
    });

    const { digest: certifyDigest } = await suiClient.signAndExecuteTransaction({
        transaction: certifyBlobTransaction,
        signer: keypair,
    });

    const { effects: certifyEffects } = await suiClient.waitForTransaction({
        digest: certifyDigest,
        options: { showEffects: true },
    });

    if (certifyEffects?.status.status !== 'success') {
        throw new Error('Failed to certify blob');
    }

    return encoded.blobId;
}