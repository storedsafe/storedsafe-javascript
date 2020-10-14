import { AxiosResponse, AxiosError } from 'axios'

export interface StoredSafeResponse<T extends StoredSafeData> extends AxiosResponse<T> {}
export interface StoredSafeError extends AxiosError<StoredSafeErrorData> {}

/// /////////////////////////////////////////////////////////
// Data types

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
  public: { [field: string]: string };
  crypted?: { [field: string]: string };
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

// NOTE: template endpoints still return 2.0.5-style response unlike templates
// returned by the object endpoint.
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

export interface StoredSafeVaultMember {
  email: string;
  fullname: string;
  groupstatus: string;
  id: string;
  status: string;
  username: string;
}

/// /////////////////////////////////////////////////////////
// Response types

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
    token?: string;
    message?: string;
  };
}

export interface StoredSafeErrorData extends StoredSafeData {
  ERRORS: string[];
  ERRORCODES: { [code: string]: string };
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

export interface StoredSafeVaultData extends StoredSafeData {
  VAULT: StoredSafeVault[];
}

export interface StoredSafeVaultsData extends StoredSafeData {
  VAULTS: StoredSafeVault[];
}

export interface StoredSafeVaultObjectsData extends StoredSafeData {
  VAULT: StoredSafeVault[];
  OBJECTS: StoredSafeObject[];
  TEMPLATES: StoredSafeTemplate[];
}

export interface StoredSafeVaultMembersData extends StoredSafeData {
  CALLINFO: {
    errorcodes: number;
    errors: number;
    general: string[];
    handler: string;
    status: string;
    token: string;
    vaultmembers: StoredSafeVaultMember[];
  };
}

export interface StoredSafeObjectData extends StoredSafeData {
  BREADCRUMB?: {
    icon: string;
    objectid: string;
    objectname: string;
  }[];
  OBJECT: StoredSafeObject[];
  TEMPLATES: StoredSafeTemplate[];
}

export interface StoredSafeCreateObjectData extends StoredSafeData {
  CALLINFO: {
    errorcodes: number;
    errors: number;
    general: string[];
    handler: string;
    status: string;
    token: string;
    message?: string;
    objectid: string;
  };
}

export interface StoredSafeTemplateData extends StoredSafeData {
  TEMPLATE: StoredSafeLegacyTemplate[];
}

export interface StoredSafeUsersData extends StoredSafeData {
  CALLINFO: {
    errorcodes: number;
    errors: number;
    general: string[];
    handler: string;
    status: string;
    token: string;
    users: StoredSafeUser[];
  };
}

export interface StoredSafeStatusValuesData extends StoredSafeData {
  CALLINFO: {
    errorcodes: number;
    errors: number;
    general: string[];
    handler: string;
    status: string;
    token: string;
    statusbits?: {
      userbits: {
        [bit: string]: number;
      };
      vaultbits: {
        [bit: string]: number;
      };
    };
  };
}

export interface StoredSafePoliciesData extends StoredSafeData {
  CALLINFO: {
    errorcodes: number;
    errors: number;
    general: string[];
    handler: string;
    status: string;
    token: string;
    policies: {
      id: number;
      name: string;
      rules: {
        min_length?: number
        max_length?: number
        min_lowercase_chars?: number
        max_lowercase_chars?: number
        min_uppercase_chars?: number
        max_uppercase_chars?: number
        disallow_numeric_chars?: boolean
        disallow_numeric_first?: boolean
        disallow_numeric_last?: boolean
        min_numeric_chars?: number
        max_numeric_chars?: number
        disallow_nonalphanumeric_chars?: boolean
        disallow_nonalphanumeric_first?: boolean
        disallow_nonalphanumeric_last?: boolean
        min_nonalphanumeric_chars?: number
        max_nonalphanumeric_chars?: number
      };
    }[];
  };
}

export interface StoredSafeVersionData extends StoredSafeData {
  CALLINFO: {
    errorcodes: number;
    errors: number;
    general: string[];
    handler: string;
    status: string;
    token: string;
    version: string;
  };
}

export interface StoredSafePasswordData extends StoredSafeData {
  CALLINFO: {
    errorcodes: number;
    errors: number;
    general: string[];
    handler: string;
    status: string;
    token: string;
    passphrase: string;
    length: number;
    type: string;
  };
}
