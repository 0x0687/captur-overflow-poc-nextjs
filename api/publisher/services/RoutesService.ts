/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Binary } from '../models/Binary';
import type { BlobStoreResult } from '../models/BlobStoreResult';
import type { EncodingType } from '../models/EncodingType';
import type { SuiAddress } from '../models/SuiAddress';
import type { u32 } from '../models/u32';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class RoutesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Store a blob on Walrus.
     * Store a (potentially deletable) blob on Walrus for 1 or more epochs. The associated on-Sui
     * object can be sent to a specified Sui address.
     * @returns BlobStoreResult The blob was stored successfully
     * @throws ApiError
     */
    public putBlob({
        requestBody,
        encodingType,
        epochs,
        deletable,
        sendObjectTo,
    }: {
        /**
         * Binary data of the unencoded blob to be stored.
         */
        requestBody: Binary,
        /**
         * The encoding type to use for the blob.
         */
        encodingType?: (null | EncodingType),
        /**
         * The number of epochs, ahead of the current one, for which to store the blob.
         *
         * The default is 1 epoch.
         */
        epochs?: u32,
        /**
         * If true, the publisher creates a deletable blob instead of a permanent one.
         */
        deletable?: boolean,
        /**
         * If specified, the publisher will send the Blob object resulting from the store operation to
         * this Sui address.
         */
        sendObjectTo?: (null | SuiAddress),
    }): CancelablePromise<BlobStoreResult> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v1/blobs',
            query: {
                'encoding_type': encodingType,
                'epochs': epochs,
                'deletable': deletable,
                'send_object_to': sendObjectTo,
            },
            body: requestBody,
            mediaType: 'application/octet-stream',
            errors: {
                400: `The request is malformed`,
                413: `The blob is too large`,
                451: ` The blob cannot be returned as has been blocked.`,
                500: `An internal server error has occurred. Please report this error.`,
                504: ` The service failed to store the blob to sufficient Walrus storage nodes before a timeout, please retry the operation.`,
            },
        });
    }
}
