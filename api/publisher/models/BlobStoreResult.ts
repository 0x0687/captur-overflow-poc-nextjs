/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Blob } from './Blob';
import type { BlobId } from './BlobId';
import type { EventID } from './EventID';
import type { EventOrObjectId } from './EventOrObjectId';
import type { ObjectID } from './ObjectID';
import type { RegisterBlobOp } from './RegisterBlobOp';
/**
 * Result when attempting to store a blob.
 */
export type BlobStoreResult = ({
    /**
     * The blob already exists within Walrus, was certified, and is stored for at least the
     * intended duration.
     */
    alreadyCertified: (EventOrObjectId & {
        /**
         * The blob ID.
         */
        blob_id: BlobId;
        /**
         * The epoch until which the blob is stored (exclusive).
         */
        end_epoch: number;
    });
} | {
    /**
     * The blob was newly created; this contains the newly created Sui object associated with the
     * blob.
     */
    newlyCreated: {
        /**
         * The Sui blob object that holds the newly created blob.
         */
        blobObject: Blob;
        /**
         * The storage cost, excluding gas.
         */
        cost: number;
        /**
         * The operation that created the blob.
         */
        resource_operation: RegisterBlobOp;
        shared_blobObject?: (null | ObjectID);
    };
} | {
    /**
     * The blob is known to Walrus but was marked as invalid.
     *
     * This indicates a bug within the client, the storage nodes, or more than a third malicious
     * storage nodes.
     */
    markedInvalid: {
        /**
         * The blob ID.
         */
        blob_id: BlobId;
        /**
         * The event where the blob was marked as invalid.
         */
        event: EventID;
    };
} | {
    /**
     * Operation failed.
     */
    error: {
        blob_id?: (null | BlobId);
        /**
         * The error message.
         */
        error_msg: string;
    };
});

