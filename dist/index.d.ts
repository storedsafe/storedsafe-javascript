import { AxiosPromise } from 'axios';
export interface StoredSafeVault {
    id: string;
    groupname: string;
    policy: string;
    description: string;
    status: string;
    statustext: string;
}
export interface StoredSafeObject {
    id: string;
    parentid: string;
    templateid: string;
    groupid: string;
    status: string;
    objectname: string;
    filename: string;
    children: string;
    notes: string;
    tags: string;
    alarmed: string;
    public: {
        [field: string]: string;
    };
    crypted?: {
        [field: string]: string;
    };
}
export interface StoredSafeTemplate {
    INFO: {
        id: string;
        name: string;
        ico: string;
        active: boolean;
        wb: boolean;
        ed?: boolean;
        jp?: boolean;
    };
    STRUCTURE: {
        [field: string]: {
            translation: string;
            type: string;
            encrypted: boolean;
            show: boolean;
            policy: boolean;
            alarm: boolean;
            opt: boolean;
            cc: boolean;
            nc: boolean;
        };
    };
}
export interface StoredSafeResponse {
    GROUP?: {
        [id: string]: StoredSafeVault;
    };
    OBJECT?: {
        [id: string]: StoredSafeObject;
    };
    TEMPLATESINFO?: {
        [field: string]: StoredSafeTemplate;
    };
    TEMPLATE?: {
        [field: string]: StoredSafeTemplate;
    };
    ERRORS?: string[];
    PARAMS: string[];
    CALLINFO: {
        ''?: string;
        token?: string;
        fingerprint?: string;
        userid?: string;
        password?: string;
        userstatus?: string;
        username?: string;
        fullname?: string;
        timeout?: number;
        filesupport?: string;
        message?: string;
        objectid?: string;
        handler: string;
        status: string;
    };
    DATA?: {
        username?: string;
        keys?: string;
        passphrase?: string;
        otp?: string;
        apikey?: string;
        logintype?: string;
        token?: string;
    };
}
export interface StoredSafePromise extends AxiosPromise<StoredSafeResponse> {
}
export declare enum LoginType {
    TOTP = "totp",
    SMARTCARD = "smc_rest"
}
declare class StoredSafe {
    private axios;
    apikey: string;
    token?: string;
    constructor(site: string, apikey: string, token?: string, version?: string);
    authYubikey(username: string, passphrase: string, otp: string): StoredSafePromise;
    authTotp(username: string, passphrase: string, otp: string): StoredSafePromise;
    authSmartcard(username: string, passphrase: string, otp: string): StoredSafePromise;
    logout(): StoredSafePromise;
    check(): StoredSafePromise;
    vaultList(): StoredSafePromise;
    vaultObjects(id: string | number): StoredSafePromise;
    vaultCreate(params: object): StoredSafePromise;
    vaultEdit(id: string | number, params: object): StoredSafePromise;
    vaultDelete(id: string | number): StoredSafePromise;
    object(id: string | number, children?: boolean): StoredSafePromise;
    objectDecrypt(id: string | number): StoredSafePromise;
    objectCreate(params: object): StoredSafePromise;
    objectEdit(id: string | number, params: object): StoredSafePromise;
    objectDelete(id: string | number): StoredSafePromise;
    find(needle: string): StoredSafePromise;
    templateList(): StoredSafePromise;
    template(id: string | number): StoredSafePromise;
}
export default StoredSafe;
