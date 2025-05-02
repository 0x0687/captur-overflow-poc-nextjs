export interface Balance {
    value: number
}

export interface Uid {
    id: string;
}

export interface Table {
    id: Uid,
    size: number
}

export interface VecSet<T> {
    contents: T[]
}

export interface VecMap<TKey, TValue> {
    contents: Map<TKey, TValue>
}

export interface MoveObject<T> {
    type: string;
    fields: T;
}


export interface DynamicObjectValue<T> {
    id: Uid;
    name: string;
    value: MoveObject<T>
}

export interface BlobModel {
    id: Uid;
    registered_epoch: number;
    blob_id: bigint;
    size: bigint;
    encoding_type: number;
}