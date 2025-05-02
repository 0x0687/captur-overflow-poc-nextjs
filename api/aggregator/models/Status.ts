/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A message returned from a failed API call.
 *
 * Contains both human-readable and machine-readable details of the error,
 * to assist in resolving the error.
 */
export type Status = {
    error: ({
        /**
         * HTTP status code associated with the error.
         */
        code: number;
        /**
         * General type of error, given as an UPPER_SNAKE_CASE string.
         */
        status: string;
    } & {
        /**
         * Machine readable details of the error.
         *
         * Always contains an [`ErrorInfo`], which provides a machine-readable
         * representation of the of the `message` field.
         */
        details: Array<Record<string, any>>;
        /**
         * A message describing the error in detail.
         */
        message: string;
    });
};

