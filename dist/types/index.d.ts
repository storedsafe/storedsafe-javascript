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
export interface StoredSafeLegacyTemplate {
    INFO: {
        id: string;
        name: string;
        ico: string;
        active: boolean;
        wb: boolean;
        ed?: boolean;
        jp?: boolean;
        file?: string;
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
            log?: boolean;
            options?: string[];
            options_default?: string;
            placeholder?: string;
            fieldname: string;
        };
    };
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
export interface StoredSafeData {
    DATA: {
        [key: string]: string | number | undefined;
    };
    HEADERS: {
        [header: string]: string;
    };
    PARAMS: [];
    CALLINFO: {
        general: string[];
        handler: string;
        status: string;
        errors: number;
        errorcodes: number;
    };
}
export interface StoredSafeErrorData extends StoredSafeData {
    ERRORS: string[];
    ERRORCODES: {
        [code: string]: string;
    };
}
export interface StoredSafeLoginData extends StoredSafeData {
    CALLINFO: {
        audit: {
            violations: [] | {
                [key: string]: string;
            };
            warnings: [] | {
                [key: string]: string;
            };
        };
        errorcodes: number;
        errors: number;
        fingerprint: string;
        userid: string;
        password: string;
        userstatus: string;
        username: string;
        fullname: string;
        timeout: number;
        filesupport: number;
        general: string[];
        handler: string;
        status: string;
        token: string;
        version: string;
    };
}
export interface StoredSafeLogoutData extends StoredSafeData {
    CALLINFO: {
        logout: string;
        errorcodes: number;
        errors: number;
        general: string[];
        handler: string;
        status: string;
        token: string;
    };
}
export interface StoredSafeCheckData extends StoredSafeData {
    CALLINFO: {
        errorcodes: number;
        errors: number;
        general: string[];
        handler: string;
        status: string;
        token: string;
    };
}
export interface StoredSafeOtherData extends StoredSafeData {
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
    TEMPLATE?: StoredSafeLegacyTemplate[];
    BREADCRUMB?: {
        icon: string;
        objectid: string;
        objectname: string;
    }[];
}
