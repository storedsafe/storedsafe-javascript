import { AxiosPromise, AxiosResponse, AxiosError } from 'axios';
import { StoredSafeData, StoredSafeErrorData, StoredSafeLoginData, StoredSafeLogoutData, StoredSafeVaultData, StoredSafeVaultObjectsData, StoredSafeVaultMembersData, StoredSafeVaultsData, StoredSafeObjectData, StoredSafeCreateObjectData, StoredSafeTemplatesData, StoredSafeTemplateData, StoredSafeStatusValuesData, StoredSafePasswordData, StoredSafePoliciesData, StoredSafeVersionData } from './types';
export { StoredSafeVault, StoredSafeUser, StoredSafeTemplate, StoredSafeLegacyTemplate, StoredSafeObject, StoredSafeVaultMember } from './types';
export { StoredSafeData, StoredSafeErrorData, StoredSafeLoginData, StoredSafeLogoutData, };
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
    check(): StoredSafePromise<StoredSafeData>;
    listVaults(): StoredSafePromise<StoredSafeVaultsData>;
    vaultObjects(id: string | number): StoredSafePromise<StoredSafeVaultObjectsData>;
    vaultMembers(id: string | number): StoredSafePromise<StoredSafeVaultMembersData>;
    createVault(params: object): StoredSafePromise<StoredSafeVaultData>;
    editVault(id: string | number, params: object): StoredSafePromise<StoredSafeVaultData>;
    deleteVault(id: string | number): StoredSafePromise<StoredSafeData>;
    getObject(id: string | number, children?: boolean): StoredSafePromise<StoredSafeObjectData>;
    decryptObject(id: string | number): StoredSafePromise<StoredSafeObjectData>;
    createObject(params: object): StoredSafePromise<StoredSafeCreateObjectData>;
    editObject(id: string | number, params: object): StoredSafePromise<StoredSafeCreateObjectData>;
    deleteObject(id: string | number): StoredSafePromise<StoredSafeData>;
    find(needle: string): StoredSafePromise<StoredSafeObjectData>;
    listTemplates(): StoredSafePromise<StoredSafeTemplatesData>;
    getTemplate(id: string | number): StoredSafePromise<StoredSafeTemplateData>;
    statusValues(): StoredSafePromise<StoredSafeStatusValuesData>;
    passwordPolicies(): StoredSafePromise<StoredSafePoliciesData>;
    version(): StoredSafePromise<StoredSafeVersionData>;
    generatePassword(params?: {
        type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin';
        length?: number;
        language?: 'en_US' | 'sv_SE';
        delimeter?: string;
        words?: number;
        min_char?: number;
        max_char?: number;
        policyid?: string;
    }): StoredSafePromise<StoredSafePasswordData>;
}
export default StoredSafe;
