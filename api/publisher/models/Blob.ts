/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlobId } from './BlobId';
import type { EncodingType } from './EncodingType';
import type { ObjectID } from './ObjectID';
import type { StorageResource } from './StorageResource';
import type { u32 } from './u32';
/**
 * Sui object for a blob.
 */
export type Blob = {
    /**
     * The blob ID.
     */
    blobId: BlobId;
    certifiedEpoch?: (null | u32);
    /**
     * Marks the blob as deletable.
     */
    deletable: boolean;
    /**
     * The encoding coding type used for the blob.
     */
    encodingType: EncodingType;
    id: ObjectID;
    /**
     * The epoch in which the blob has been registered.
     */
    registeredEpoch: u32;
    /**
     * The (unencoded) size of the blob.
     */
    size: number;
    /**
     * The [`StorageResource`] used to store the blob.
     */
    storage: StorageResource;
};

