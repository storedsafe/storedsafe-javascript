/* eslint-disable @typescript-eslint/member-delimiter-style */
import axios, {
  AxiosInstance,
  AxiosPromise,
  AxiosResponse,
  AxiosError
} from 'axios'
import {
  StoredSafeData,
  StoredSafeErrorData,
  StoredSafeLoginData,
  StoredSafeLogoutData,
  StoredSafeCheckData,
  StoredSafeOtherData
} from './types'

export {
  StoredSafeData,
  StoredSafeErrorData,
  StoredSafeLoginData,
  StoredSafeLogoutData,
  StoredSafeCheckData,
  StoredSafeOtherData
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoredSafeResponse<T extends StoredSafeData>
  extends AxiosResponse<T> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoredSafePromise<T extends StoredSafeData>
  extends AxiosPromise<T> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoredSafeError extends AxiosError<StoredSafeErrorData> {}

export enum LoginType {
  TOTP = 'totp',
  SMARTCARD = 'smc_rest'
}

class StoredSafe {
  private axios: AxiosInstance

  apikey?: string
  token?: string

  constructor (
    {
      host,
      apikey,
      token
    }: {
      host: string
      apikey?: string
      token?: string
    },
    version = '1.0'
  ) {
    this.axios = axios.create({
      baseURL: `https://${host}/api/${version}/`,
      timeout: 5000
    })
    this.apikey = apikey
    this.token = token
  }

  private assertApikeyExists (): void {
    if (this.apikey === undefined) {
      throw new Error('Path requires apikey, apikey is undefined.')
    }
  }

  private assertTokenExists (): void {
    if (this.token === undefined) {
      throw new Error('Path requires token, token is undefined.')
    }
  }

  loginYubikey (
    username: string,
    passphrase: string,
    otp: string
  ): StoredSafePromise<StoredSafeLoginData> {
    this.assertApikeyExists()
    return this.axios
      .post('/auth', {
        username: username,
        keys: `${passphrase}${this.apikey}${otp}`
      })
      .then(response => {
        this.token = response.data.CALLINFO.token
        return response
      })
  }

  loginTotp (
    username: string,
    passphrase: string,
    otp: string
  ): StoredSafePromise<StoredSafeLoginData> {
    this.assertApikeyExists()
    return this.axios
      .post('/auth', {
        username: username,
        passphrase: passphrase,
        otp: otp,
        logintype: LoginType.TOTP,
        apikey: this.apikey
      })
      .then(response => {
        this.token = response.data.CALLINFO.token
        return response
      })
  }

  logout (): StoredSafePromise<StoredSafeLogoutData> {
    this.assertTokenExists()
    return this.axios
      .get('/auth/logout', {
        headers: { 'X-Http-Token': this.token }
      })
      .then(response => {
        this.token = undefined
        return response
      })
  }

  check (): StoredSafePromise<StoredSafeCheckData> {
    this.assertTokenExists()
    return this.axios.post(
      '/auth/check',
      {},
      {
        headers: { 'X-Http-Token': this.token }
      }
    )
  }

  listVaults (): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get('/vault', {
      headers: { 'X-Http-Token': this.token }
    })
  }

  vaultObjects (id: string | number): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get(`/vault/${id}`, {
      headers: { 'X-Http-Token': this.token }
    })
  }

  vaultMembers (id: string | number): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get(`/vault/${id}/members`, {
      headers: { 'X-Http-Token': this.token }
    })
  }

  createVault (params: object): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.post(
      '/vault',
      {
        ...params
      },
      {
        headers: { 'X-Http-Token': this.token }
      }
    )
  }

  editVault (
    id: string | number,
    params: object
  ): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.put(
      `/vault/${id}`,
      {
        ...params
      },
      {
        headers: { 'X-Http-Token': this.token }
      }
    )
  }

  deleteVault (id: string | number): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.delete(`/vault/${id}`, {
      headers: { 'X-Http-Token': this.token }
    })
  }

  object (
    id: string | number,
    children = false
  ): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get(`/object/${id}`, {
      params: { children: children },
      headers: { 'X-Http-Token': this.token }
    })
  }

  decryptObject (id: string | number): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get(`/object/${id}`, {
      params: { decrypt: true },
      headers: { 'X-Http-Token': this.token }
    })
  }

  createObject (params: object): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.post(
      '/object',
      {
        ...params
      },
      {
        headers: { 'X-Http-Token': this.token }
      }
    )
  }

  editObject (
    id: string | number,
    params: object
  ): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.put(
      `/object/${id}`,
      {
        ...params
      },
      {
        headers: { 'X-Http-Token': this.token }
      }
    )
  }

  deleteObject (id: string | number): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.delete(`/object/${id}`, {
      headers: { 'X-Http-Token': this.token }
    })
  }

  find (needle: string): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get('/find', {
      params: { needle: needle },
      headers: { 'X-Http-Token': this.token }
    })
  }

  listTemplates (): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get('/template', {
      headers: { 'X-Http-Token': this.token }
    })
  }

  template (id: string | number): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get(`/template/${id}`, {
      headers: { 'X-Http-Token': this.token }
    })
  }

  permissionBits (): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get('/utils/statusvalues', {
      headers: { 'X-Http-Token': this.token }
    })
  }

  passwordPolicies (): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get('/utils/policies', {
      headers: { 'X-Http-Token': this.token }
    })
  }

  version (): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get('/utils/version', {
      headers: { 'X-Http-Token': this.token }
    })
  }

  generatePassword (
    params: {
      type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin'
      length?: number
      language?: 'en_US' | 'sv_SE'
      delimeter?: string
      words?: number
      min_char?: number
      max_char?: number
      policyid?: string
    } = {}
  ): StoredSafePromise<StoredSafeOtherData> {
    this.assertTokenExists()
    return this.axios.get('utils/pwgen', {
      headers: { 'X-Http-Token': this.token },
      params
    })
  }
}

export default StoredSafe
