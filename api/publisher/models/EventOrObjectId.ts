/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventID } from './EventID';
import type { ObjectID } from './ObjectID';
/**
 * Either an event ID or an object ID.
 */
export type EventOrObjectId = ({
    /**
     * The variant representing an event ID.
     */
    event: EventID;
} | {
    /**
     * The variant representing an object ID.
     */
    object: ObjectID;
});

