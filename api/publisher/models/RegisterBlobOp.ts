/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * The operation performed on blob and storage resources to register a blob.
 */
export type RegisterBlobOp = ({
    /**
     * The storage and blob resources are purchased from scratch.
     */
    registerFromScratch: {
        /**
         * The size of the encoded blob in bytes.
         */
        encoded_length: number;
        /**
         * The number of epochs ahead for which the blob is registered.
         */
        epochs_ahead: number;
    };
} | {
    /**
     * The storage is reused, but the blob was not registered.
     */
    reuseStorage: {
        /**
         * The size of the encoded blob in bytes.
         */
        encoded_length: number;
    };
} | {
    /**
     * A registration was already present.
     */
    reuseRegistration: {
        /**
         * The size of the encoded blob in bytes.
         */
        encoded_length: number;
    };
} | {
    /**
     * The blob was already certified, but its lifetime is too short.
     */
    reuseAndExtend: {
        /**
         * The size of the encoded blob in bytes.
         */
        encoded_length: number;
        /**
         * The number of epochs extended wrt the original epoch end.
         */
        epochs_extended: number;
    };
} | {
    /**
     * The blob was registered, but not certified, and its lifetime is shorter than
     * the desired one.
     */
    reuseAndExtendNonCertified: {
        /**
         * The size of the encoded blob in bytes.
         */
        encoded_length: number;
        /**
         * The number of epochs extended wrt the original epoch end.
         */
        epochs_extended: number;
    };
});

