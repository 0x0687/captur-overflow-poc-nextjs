import { Balance, BlobModel, MoveObject, Table, Uid } from "./shared-models";

export const errorMessages: Record<string, Record<number, string>> = {
    vault: {
        1: "Insufficient balance",
    },
    subscription: {
        1: "Invalid number of epochs",
    },
    data_point: {
        1: "Data already processed",
    },

};

export interface DataPointModel { 
    id: Uid;
    sender: string;
    age_range: string;
    gender: string;
    status: string;
    blob: MoveObject<BlobModel>;
}

export interface CapturModel {
    id: Uid;
    vault: MoveObject<VaultModel>;
    state: MoveObject<StateModel>;
    price_per_epoch: number
}

export interface VaultModel{
    balance: Balance
}

export interface StateModel {
    subscriptions: MoveObject<Table>;
}

export interface SubscriptionModel {
    address: string;
    start_epoch: number;
    end_epoch: number;
}

export interface BlobSubmittedEventModel {
    capture_id: string;
    sender: string;
}

export interface DataProcessedEventModel {
    capture_id: string;
    value: number;
}

export interface CapturAdminCapModel {
    id: Uid;
}

export interface ProcessingCapModel {
    id: Uid;
}