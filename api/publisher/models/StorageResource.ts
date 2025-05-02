/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ObjectID } from './ObjectID';
import type { u32 } from './u32';
/**
 * Sui object for storage resources.
 */
export type StorageResource = {
    /**
     * The end epoch of the resource (exclusive).
     */
    endEpoch: u32;
    id: ObjectID;
    /**
     * The start epoch of the resource (inclusive).
     */
    startEpoch: u32;
    /**
     * The total amount of reserved storage.
     */
    storageSize: number;
};

