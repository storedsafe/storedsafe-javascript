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
    fileinfo?: {
        objectid: string;
        name: string;
        size: string;
        type: string;
        filepath: string;
        created: string;
        ext: string;
        iconpath: string;
    };
    id: string;
    parentid: string;
    templateid: string;
    groupid: string;
    status: string;
    objectname: string;
    filename: string;
    children: string;
    notes: string | boolean;
    tags: string;
    alarmed: string | boolean;
    public: {
        [field: string]: string;
    };
    crypted?: {
        [field: string]: string;
    };
}
export interface StoredSafeTemplate {
    id: string;
    info: {
        id: string;
        name: string;
        ico: string;
        active: boolean;
        wb: boolean;
        ed?: boolean;
        jp?: boolean;
        file?: string;
    };
    structure: {
        translation: string;
        type: string;
        encrypted: boolean;
        show: boolean;
        policy: boolean;
        alarm: boolean;
        opt: boolean;
        cc: boolean;
        nc: boolean;
        log?: boolean;
        options?: string[];
        options_default?: string;
        placeholder?: string;
        fieldname: string;
    }[];
}
export interface StoredSafeUser {
    email: string;
    fingerprint: string;
    fullname: string;
    id: string;
    otpprefix: string;
    status: string;
    username: string;
}
export interface StoredSafeResponse {
    DATA: {
        [key: string]: string | number | undefined;
    };
    HEADERS: {
        [header: string]: string;
    };
    PARAMS: [];
    ERRORS?: string[];
    ERRORCODES?: {
        [code: string]: string;
    };
    CALLINFO: {
        errorcodes: number;
        errors: number;
        general: string[];
        handler: string;
        status: string;
        token?: string;
        fingerprint?: string;
        userid?: string;
        password?: string;
        userstatus?: string;
        username?: string;
        fullname?: string;
        timeout?: number;
        filesupport?: number;
        logout?: string;
        audit?: {
            violations: [] | {
                [key: string]: string;
            };
            warnings: [] | {
                [key: string]: string;
            };
        };
        vaultmembers?: {
            email: string;
            fullname: string;
            groupstatus: string;
            id: string;
            status: string;
            username: string;
        }[];
        message?: string;
        objectid?: string;
        calculated_status?: string;
        user_created?: string;
        users?: StoredSafeUser[];
        statusbits?: {
            userbits: {
                [bit: string]: number;
            };
            vaultbits: {
                [bit: string]: number;
            };
        };
        policies?: {
            id: string;
            name: string;
            rules: {
                min_length?: number;
                min_lowercase_chars?: number;
                min_nonalphanumeric_chars?: number;
                min_numeric_chars?: number;
                min_uppercase_chars?: number;
            };
        }[];
        version?: string;
        passphrase?: string;
        length?: string;
        type?: string;
    };
    VAULTS?: StoredSafeVault[];
    VAULT?: StoredSafeVault[];
    OBJECTS?: StoredSafeObject[];
    OBJECT?: StoredSafeObject[];
    TEMPLATES?: StoredSafeTemplate[];
    TEMPLATE?: StoredSafeTemplate[];
    BREADCRUMB?: {
        icon: string;
        objectid: string;
        objectname: string;
    }[];
}
export interface StoredSafePromise extends AxiosPromise<StoredSafeResponse> {
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
    loginYubikey(username: string, passphrase: string, otp: string): StoredSafePromise;
    loginTotp(username: string, passphrase: string, otp: string): StoredSafePromise;
    loginSmartcard(username: string, passphrase: string, otp: string): StoredSafePromise;
    logout(): StoredSafePromise;
    check(): StoredSafePromise;
    listVaults(): StoredSafePromise;
    vaultObjects(id: string | number): StoredSafePromise;
    vaultMembers(id: string | number): StoredSafePromise;
    createVault(params: object): StoredSafePromise;
    editVault(id: string | number, params: object): StoredSafePromise;
    deleteVault(id: string | number): StoredSafePromise;
    object(id: string | number, children?: boolean): StoredSafePromise;
    decryptObject(id: string | number): StoredSafePromise;
    createObject(params: object): StoredSafePromise;
    editObject(id: string | number, params: object): StoredSafePromise;
    deleteObject(id: string | number): StoredSafePromise;
    find(needle: string): StoredSafePromise;
    listTemplates(): StoredSafePromise;
    template(id: string | number): StoredSafePromise;
    permissionBits(): StoredSafePromise;
    passwordPolicies(): StoredSafePromise;
    version(): StoredSafePromise;
    generatePassword(params?: {
        type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin';
        length?: number;
        language?: 'en_US' | 'sv_SE';
        delimeter?: string;
        words?: number;
        min_char?: number;
        max_char?: number;
        policyid?: string;
    }): StoredSafePromise;
}
export default StoredSafe;
