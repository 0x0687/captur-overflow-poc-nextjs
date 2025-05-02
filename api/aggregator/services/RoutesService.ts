/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlobId } from '../models/BlobId';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class RoutesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Retrieve a Walrus blob with its associated attribute.
     * First retrieves the blob metadata from Sui using the provided blob object ID, then uses the
     * blob_id from that metadata to fetch the actual blob data via the get_blob function. The response
     * includes the binary data along with any attribute headers from the metadata that are present in
     * the configured allowed_headers set.
     * @returns string The blob was reconstructed successfully. Any attribute headers present in the allowed_headers configuration will be included in the response.
     * @throws ApiError
     */
    public getBlobByObjectId({
        blobObjectId,
    }: {
        blobObjectId: string,
    }): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/blobs/by-object-id/{blob_object_id}',
            path: {
                'blob_object_id': blobObjectId,
            },
            errors: {
                404: ` The requested blob has not yet been stored on Walrus.`,
                451: ` The blob cannot be returned as has been blocked.`,
                500: `An internal server error has occurred. Please report this error.`,
            },
        });
    }
    /**
     * Retrieve a Walrus blob.
     * Reconstructs the blob identified by the provided blob ID from Walrus and return it binary data.
     * @returns string The blob was reconstructed successfully
     * @throws ApiError
     */
    public getBlob({
        blobId,
    }: {
        blobId: BlobId,
    }): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/blobs/{blob_id}',
            path: {
                'blob_id': blobId,
            },
            errors: {
                404: ` The requested blob has not yet been stored on Walrus.`,
                451: ` The blob cannot be returned as has been blocked.`,
                500: `An internal server error has occurred. Please report this error.`,
            },
        });
    }
}
