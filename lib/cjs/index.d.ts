export * from './types';
import { StoredSafeResponse, StoredSafeLoginData, StoredSafeLogoutData, StoredSafeCheckData, StoredSafeVaultsData, StoredSafeVaultObjectsData, StoredSafeVaultMembersData, StoredSafeVaultData, StoredSafeData, StoredSafeObjectData, StoredSafeCreateObjectData, StoredSafeTemplateData, StoredSafeStatusValuesData, StoredSafePoliciesData, StoredSafeVersionData, StoredSafePasswordData } from './types';
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
    loginYubikey(username: string, passphrase: string, otp: string): Promise<StoredSafeResponse<StoredSafeLoginData>>;
    loginTotp(username: string, passphrase: string, otp: string): Promise<StoredSafeResponse<StoredSafeLoginData>>;
    logout(): Promise<StoredSafeResponse<StoredSafeLogoutData>>;
    check(): Promise<StoredSafeResponse<StoredSafeCheckData>>;
    listVaults(): Promise<StoredSafeResponse<StoredSafeVaultsData>>;
    vaultObjects(id: string | number): Promise<StoredSafeResponse<StoredSafeVaultObjectsData>>;
    vaultMembers(id: string | number): Promise<StoredSafeResponse<StoredSafeVaultMembersData>>;
    createVault(params: object): Promise<StoredSafeResponse<StoredSafeVaultData>>;
    editVault(id: string | number, params: object): Promise<StoredSafeResponse<StoredSafeVaultData>>;
    deleteVault(id: string | number): Promise<StoredSafeResponse<StoredSafeData>>;
    getObject(id: string | number, children?: boolean): Promise<StoredSafeResponse<StoredSafeObjectData>>;
    decryptObject(id: string | number): Promise<StoredSafeResponse<StoredSafeObjectData>>;
    createObject(params: object): Promise<StoredSafeResponse<StoredSafeCreateObjectData>>;
    editObject(id: string | number, params: object): Promise<StoredSafeResponse<StoredSafeCreateObjectData>>;
    deleteObject(id: string | number): Promise<StoredSafeResponse<StoredSafeData>>;
    find(needle: string): Promise<StoredSafeResponse<StoredSafeObjectData>>;
    listTemplates(): Promise<StoredSafeResponse<StoredSafeTemplateData>>;
    getTemplate(id: string | number): Promise<StoredSafeResponse<StoredSafeTemplateData>>;
    statusValues(): Promise<StoredSafeResponse<StoredSafeStatusValuesData>>;
    passwordPolicies(): Promise<StoredSafeResponse<StoredSafePoliciesData>>;
    version(): Promise<StoredSafeResponse<StoredSafeVersionData>>;
    generatePassword(params?: {
        type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin';
        length?: number;
        language?: 'en_US' | 'sv_SE';
        delimeter?: string;
        words?: number;
        min_char?: number;
        max_char?: number;
        policyid?: string;
    }): Promise<StoredSafeResponse<StoredSafePasswordData>>;
}
export default StoredSafe;
