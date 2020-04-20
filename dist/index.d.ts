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
    id: number;
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
}
export interface StoredSafeTemplate {
    INFO: {
        id: string;
        name: string;
        ico: string;
        active: string;
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
export declare enum LoginType {
    TOTP = "totp",
    SMARTCARD = "smc_rest"
}
declare class StoredSafe {
    private axios;
    apikey: string;
    token?: string;
    constructor(site: string, apikey: string, token?: string, version?: string);
    authYubikey(username: string, passphrase: string, otp: string): AxiosPromise<StoredSafeResponse>;
    authTotp(username: string, passphrase: string, otp: string): AxiosPromise<StoredSafeResponse>;
    authSmartcard(username: string, passphrase: string, otp: string): AxiosPromise<StoredSafeResponse>;
    logout(): AxiosPromise<StoredSafeResponse>;
    check(): AxiosPromise<StoredSafeResponse>;
    vaultList(): AxiosPromise<StoredSafeResponse>;
    vaultObjects(id: string | number): AxiosPromise<StoredSafeResponse>;
    vaultCreate(params: object): AxiosPromise<StoredSafeResponse>;
    vaultEdit(id: string | number, params: object): AxiosPromise<StoredSafeResponse>;
    vaultDelete(id: string | number): AxiosPromise<StoredSafeResponse>;
    object(id: string | number, children?: boolean): AxiosPromise<StoredSafeResponse>;
    objectDecrypt(id: string | number): AxiosPromise<StoredSafeResponse>;
    objectCreate(params: object): AxiosPromise<StoredSafeResponse>;
    objectEdit(id: string | number, params: object): AxiosPromise<StoredSafeResponse>;
    objectDelete(id: string | number): AxiosPromise<StoredSafeResponse>;
    find(needle: string): AxiosPromise<StoredSafeResponse>;
    templateList(): AxiosPromise<StoredSafeResponse>;
    template(id: string | number): AxiosPromise<StoredSafeResponse>;
}
export default StoredSafe;
