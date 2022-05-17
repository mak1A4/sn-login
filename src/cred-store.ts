import { findCredentials, getPassword, setPassword, deletePassword } from 'keytar';

export interface IInstanceCredentials {
    user: string;
    password: string;
}

export interface IInstanceMultiFactorKey {
    user: string;
    mfaKey: string;
}

function _getInstanceName(instance: string): string {
    instance = instance.toLowerCase();
    return `${instance}.service-now.com`;
}

function _getMultiFactorServiceName(instance: string) {
    let instanceName = _getInstanceName(instance);
    return `${instanceName}::mfakey`
}

export async function getAllInstanceCredentials(instance: string): Promise<Array<IInstanceCredentials>> {
    let instanceName = _getInstanceName(instance);
    let result = await findCredentials(instanceName);
    return result.map((c) => {
        return {
            "user": c.account,
            "password": c.password
        };
    });
}

export async function getInstanceCredentials(instance: string, user: string): Promise<IInstanceCredentials> {
    let instanceName = _getInstanceName(instance);
    let passwd = await getPassword(instanceName, user) as string;
    return {
        "user": user,
        "password": passwd
    };
}

export async function storeInstanceCredentials(instance: string, user: string, password: string): Promise<void> {
    let instanceName = _getInstanceName(instance);
    await setPassword(instanceName, user, password);
}

export async function deleteInstanceCredentials(instance: string, user: string): Promise<void> {
    let instanceName = _getInstanceName(instance);
    await deletePassword(instanceName, user);
}

export async function getAllInstanceMultiFactorKeys(instance: string): Promise<Array<IInstanceMultiFactorKey>> {
    let result = await findCredentials(_getMultiFactorServiceName(instance));
    return result.map((m) => {
        return {
            "user": m.account,
            "mfaKey": m.password
        };
    })
}

export async function getInstanceMultiFactorKey(instance: string, user: string): Promise<IInstanceMultiFactorKey> {
    let passwd = await getPassword(_getMultiFactorServiceName(instance), user) as string;
    return {
        "user": user,
        "mfaKey": passwd
    };
}

export async function storeInstanceMultiFactorKey(instance: string, user: string, mfaKey: string): Promise<void> {
    await setPassword(_getMultiFactorServiceName(instance), user, mfaKey);
}

export async function deleteInstanceMultiFactorKey(instance: string, user: string) {
    await deletePassword(_getMultiFactorServiceName(instance), user);
}