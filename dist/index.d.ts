import { AxiosPromise, AxiosResponse, AxiosError } from 'axios';
import { StoredSafeData, StoredSafeErrorData, StoredSafeLoginData, StoredSafeLogoutData, StoredSafeCheckData, StoredSafeOtherData } from './types';
export { StoredSafeData, StoredSafeErrorData, StoredSafeLoginData, StoredSafeLogoutData, StoredSafeCheckData, StoredSafeOtherData };
export interface StoredSafeResponse<T extends StoredSafeData> extends AxiosResponse<T> {
}
export interface StoredSafePromise<T extends StoredSafeData> extends AxiosPromise<T> {
}
export interface StoredSafeError extends AxiosError<StoredSafeErrorData> {
}
export declare enum LoginType {
    TOTP = "totp",
    SMARTCARD = "smc_rest"
}
declare class StoredSafe {
    private axios;
    apikey?: string;
    token?: string;
    constructor({ host, apikey, token }: {
        host: string;
        apikey?: string;
        token?: string;
    }, version?: string);
    private assertApikeyExists;
    private assertTokenExists;
    loginYubikey(username: string, passphrase: string, otp: string): StoredSafePromise<StoredSafeLoginData>;
    loginTotp(username: string, passphrase: string, otp: string): StoredSafePromise<StoredSafeLoginData>;
    logout(): StoredSafePromise<StoredSafeLogoutData>;
    check(): StoredSafePromise<StoredSafeCheckData>;
    listVaults(): StoredSafePromise<StoredSafeOtherData>;
    vaultObjects(id: string | number): StoredSafePromise<StoredSafeOtherData>;
    vaultMembers(id: string | number): StoredSafePromise<StoredSafeOtherData>;
    createVault(params: object): StoredSafePromise<StoredSafeOtherData>;
    editVault(id: string | number, params: object): StoredSafePromise<StoredSafeOtherData>;
    deleteVault(id: string | number): StoredSafePromise<StoredSafeOtherData>;
    object(id: string | number, children?: boolean): StoredSafePromise<StoredSafeOtherData>;
    decryptObject(id: string | number): StoredSafePromise<StoredSafeOtherData>;
    createObject(params: object): StoredSafePromise<StoredSafeOtherData>;
    editObject(id: string | number, params: object): StoredSafePromise<StoredSafeOtherData>;
    deleteObject(id: string | number): StoredSafePromise<StoredSafeOtherData>;
    find(needle: string): StoredSafePromise<StoredSafeOtherData>;
    listTemplates(): StoredSafePromise<StoredSafeOtherData>;
    template(id: string | number): StoredSafePromise<StoredSafeOtherData>;
    permissionBits(): StoredSafePromise<StoredSafeOtherData>;
    passwordPolicies(): StoredSafePromise<StoredSafeOtherData>;
    version(): StoredSafePromise<StoredSafeOtherData>;
    generatePassword(params?: {
        type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin';
        length?: number;
        language?: 'en_US' | 'sv_SE';
        delimeter?: string;
        words?: number;
        min_char?: number;
        max_char?: number;
        policyid?: string;
    }): StoredSafePromise<StoredSafeOtherData>;
}
export default StoredSafe;
