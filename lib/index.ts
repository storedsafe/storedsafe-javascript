import axios, { AxiosInstance, AxiosPromise } from 'axios';

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

export interface StoredSafeResponse {
  DATA: {
    [key: string]: string | number | undefined;
  };
  HEADERS: {
    [header: string]: string;
  };
  PARAMS: [];
  ERRORS?: string[];
  ERRORCODES?: { [code: string]: string };
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
    filesupport?: number; // Docs say string
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoredSafePromise extends AxiosPromise<StoredSafeResponse> {}

export enum LoginType {
  TOTP = 'totp',
  SMARTCARD =  'smc_rest',
}

class StoredSafe {
  private axios: AxiosInstance;

  apikey?: string;
  token?: string;

  constructor({ host, apikey, token }: {
    host: string;
    apikey?: string;
    token?: string;
  },
    version='1.0'
  ) {
    this.axios = axios.create({
      baseURL: `https://${host}/api/${version}/`,
      timeout: 5000,
    });
    this.apikey = apikey;
    this.token = token;
  }

  private assertApikeyExists(): void {
    if (this.apikey === undefined) {
      throw new Error('Path requires apikey, apikey is undefined.');
    }
  }

  private assertTokenExists(): void {
    if (this.token === undefined) {
      throw new Error('Path requires token, token is undefined.');
    }
  }

  loginYubikey(
    username: string,
    passphrase: string,
    otp: string,
  ): StoredSafePromise {
    this.assertApikeyExists();
    return this.axios.post('/auth', {
      username: username,
      keys: `${passphrase}${this.apikey}${otp}`,
    }).then(response => {
      this.token = response.data.CALLINFO.token;
      return response;
    });
  }

  loginTotp(
    username: string,
    passphrase: string,
    otp: string,
  ): StoredSafePromise {
    this.assertApikeyExists();
    return this.axios.post('/auth', {
      username: username,
      passphrase: passphrase,
      otp: otp,
      logintype: LoginType.TOTP,
      apikey: this.apikey,
    }).then(response => {
      this.token = response.data.CALLINFO.token;
      return response;
    });
  }

  loginSmartcard(
    username: string,
    passphrase: string,
    otp: string,
  ): StoredSafePromise {
    this.assertApikeyExists();
    return this.axios.post('/auth', {
      username: username,
      passphrase: passphrase,
      otp: otp,
      logintype: LoginType.SMARTCARD,
      apikey: this.apikey,
    }).then(response => {
      this.token = response.data.CALLINFO.token;
      return response;
    });
  }

  logout(): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get('/auth/logout', {
      headers: { 'X-Http-Token': this.token },
    }).then(response => {
      this.token = undefined;
      return response;
    });
  }

  check(): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.post('/auth/check', {}, {
      headers: { 'X-Http-Token': this.token },
    });
  }

  listVaults(): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get('/vault', {
      headers: { 'X-Http-Token': this.token },
    });
  }

  vaultObjects(
    id: string | number,
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get(`/vault/${id}`, {
      headers: { 'X-Http-Token': this.token },
    });
  }

  vaultMembers(
    id: string | number,
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get(`/vault/${id}/members`, {
      headers: { 'X-Http-Token': this.token },
    });
  }

  createVault(
    params: object
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.post('/vault', {
      ...params,
    }, {
      headers: { 'X-Http-Token': this.token },
    });
  }

  editVault(
    id: string | number,
    params: object,
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.put(`/vault/${id}`, {
      ...params,
    }, {
      headers: { 'X-Http-Token': this.token },
    });
  }

  deleteVault(
    id: string | number,
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.delete(`/vault/${id}`, {
      headers: { 'X-Http-Token': this.token },
    });
  }

  object(
    id: string | number,
    children=false,
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get(`/object/${id}`, {
      params: { children: children },
      headers: { 'X-Http-Token': this.token },
    });
  }

  decryptObject(
    id: string | number,
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get(`/object/${id}`, {
      params: { decrypt: true },
      headers: { 'X-Http-Token': this.token },
    });
  }

  createObject(
    params: object,
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.post('/object', {
      ...params,
    }, {
      headers: { 'X-Http-Token': this.token },
    });
  }

  editObject(
    id: string | number,
    params: object,
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.put(`/object/${id}`, {
      ...params,
    }, {
      headers: { 'X-Http-Token': this.token },
    });
  }

  deleteObject(
    id: string | number,
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.delete(`/object/${id}`, {
      headers: { 'X-Http-Token': this.token },
    });
  }

  find(
    needle: string
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get('/find', {
      params: { needle: needle },
      headers: { 'X-Http-Token': this.token },
    });
  }

  listTemplates(): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get('/template', {
      headers: { 'X-Http-Token': this.token },
    });
  }

  template(
    id: string | number,
  ): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get(`/template/${id}`, {
      headers: { 'X-Http-Token': this.token },
    });
  }

  permissionBits(): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get('/utils/statusvalues', {
      headers: { 'X-Http-Token': this.token },
    });
  }

  passwordPolicies(): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get('/utils/policies', {
      headers: { 'X-Http-Token': this.token },
    });
  }

  version(): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get('/utils/version', {
      headers: { 'X-Http-Token': this.token },
    });
  }

  generatePassword(params: {
    type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin';
    length?: number;
    language?: 'en_US' | 'sv_SE';
    delimeter?: string;
    words?: number;
    min_char?: number;
    max_char?: number;
    policyid?: string;
  } = {}): StoredSafePromise {
    this.assertTokenExists();
    return this.axios.get('utils/pwgen', {
      headers: { 'X-Http-Token': this.token },
      params,
    });
  }
}

export default StoredSafe;
