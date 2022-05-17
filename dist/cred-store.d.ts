export interface IInstanceCredentials {
    user: string;
    password: string;
}
export interface IInstanceMultiFactorKey {
    user: string;
    mfaKey: string;
}
export declare function getAllInstanceCredentials(instance: string): Promise<Array<IInstanceCredentials>>;
export declare function getInstanceCredentials(instance: string, user: string): Promise<IInstanceCredentials>;
export declare function storeInstanceCredentials(instance: string, user: string, password: string): Promise<void>;
export declare function deleteInstanceCredentials(instance: string, user: string): Promise<void>;
export declare function getAllInstanceMultiFactorKeys(instance: string): Promise<Array<IInstanceMultiFactorKey>>;
export declare function getInstanceMultiFactorKey(instance: string, user: string): Promise<IInstanceMultiFactorKey>;
export declare function storeInstanceMultiFactorKey(instance: string, user: string, mfaKey: string): Promise<void>;
export declare function deleteInstanceMultiFactorKey(instance: string, user: string): Promise<void>;
