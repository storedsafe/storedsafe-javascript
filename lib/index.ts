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
  public: { [field: string]: string };
  crypted?: { [field: string]: string };
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoredSafePromise extends AxiosPromise<StoredSafeResponse> {}

export enum LoginType {
  TOTP = 'totp',
  SMARTCARD =  'smc_rest',
}

class StoredSafe {
  private axios: AxiosInstance;

  apikey: string;
  token?: string;

  constructor(
    site: string,
    apikey: string,
    token?: string,
    version='1.0'
  ) {
    this.axios = axios.create({
      baseURL: `https://${site}/api/${version}/`,
      timeout: 5000,
    });
    this.apikey = apikey;
    this.token = token;
  }

  authYubikey(
    username: string,
    passphrase: string,
    otp: string,
  ): StoredSafePromise {
    return this.axios.post('/auth', {
      username: username,
      keys: `${passphrase}${this.apikey}${otp}`,
    }).then(response => {
      this.token = response.data.CALLINFO.token;
      return response;
    });
  }

  authTotp(
    username: string,
    passphrase: string,
    otp: string,
  ): StoredSafePromise {
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

  authSmartcard(
    username: string,
    passphrase: string,
    otp: string,
  ): StoredSafePromise {
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
    return this.axios.get('/auth/logout', {
      params: { token: this.token },
    }).then(response => {
      this.token = undefined;
      return response;
    });
  }

  check(): StoredSafePromise {
    return this.axios.post('/auth/check', {
      token: this.token
    });
  }

  vaultList(): StoredSafePromise {
    return this.axios.get('/vault', {
      params: { token: this.token },
    });
  }

  vaultObjects(
    id: string | number,
  ): StoredSafePromise {
    return this.axios.get(`/vault/${id}`, {
      params: { token: this.token },
    });
  }

  vaultCreate(
    params: object
  ): StoredSafePromise {
    return this.axios.post('/vault', {
      ...params,
      token: this.token,
    });
  }

  vaultEdit(
    id: string | number,
    params: object,
  ): StoredSafePromise {
    return this.axios.put(`/vault/${id}`, {
      ...params,
      token: this.token,
    });
  }

  vaultDelete(
    id: string | number,
  ): StoredSafePromise {
    return this.axios.delete(`/vault/${id}`, {
      params: { token: this.token },
    });
  }

  object(
    id: string | number,
    children=false,
  ): StoredSafePromise {
    return this.axios.get(`/object/${id}`, {
      params: { token: this.token, children: children },
    });
  }

  objectDecrypt(
    id: string | number,
  ): StoredSafePromise {
    return this.axios.get(`/object/${id}`, {
      params: { token: this.token, decrypt: true },
    });
  }

  objectCreate(
    params: object,
  ): StoredSafePromise {
    return this.axios.post('/object', {
      ...params,
      token: this.token,
    });
  }

  objectEdit(
    id: string | number,
    params: object,
  ): StoredSafePromise {
    return this.axios.put(`/object/${id}`, {
      ...params,
      token: this.token,
    });
  }

  objectDelete(
    id: string | number,
  ): StoredSafePromise {
    return this.axios.delete(`/object/${id}`, {
      params: { token: this.token },
    });
  }

  find(
    needle: string
  ): StoredSafePromise {
    return this.axios.get('/find', {
      params: { token: this.token, needle: needle },
    });
  }

  templateList(): StoredSafePromise {
    return this.axios.get('/template', {
      params: { token: this.token },
    });
  }

  template(
    id: string | number,
  ): StoredSafePromise {
    return this.axios.get(`/template/${id}`, {
      params: { token: this.token },
    });
  }
}

export default StoredSafe;
