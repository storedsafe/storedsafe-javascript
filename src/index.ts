export * from './types'

import axios, { AxiosInstance } from 'axios'
import {
  StoredSafeResponse,
  StoredSafeLoginData,
  StoredSafeLogoutData,
  StoredSafeCheckData,
  StoredSafeVaultsData,
  StoredSafeVaultObjectsData,
  StoredSafeVaultMembersData,
  StoredSafeVaultData,
  StoredSafeData,
  StoredSafeObjectData,
  StoredSafeCreateObjectData,
  StoredSafeTemplateData,
  StoredSafeStatusValuesData,
  StoredSafePoliciesData,
  StoredSafeVersionData,
  StoredSafePasswordData
} from './types'

export enum LoginType {
  TOTP = 'totp',
  SMARTCARD = 'smc_rest'
}

class StoredSafe {
  private axios: AxiosInstance

  apikey?: string
  token?: string

  constructor (
    { host, apikey, token }: { host: string; apikey?: string; token?: string },
    version = '1.0'
  ) {
    this.axios = axios.create({
      baseURL: `https://${host}/api/${version}/`,
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200 && status < 500
      }
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

  async loginYubikey (
    username: string,
    passphrase: string,
    otp: string
  ): Promise<StoredSafeResponse<StoredSafeLoginData>> {
    this.assertApikeyExists()
    const response = await this.axios.post('/auth', {
      username: username,
      keys: `${passphrase}${this.apikey}${otp}`
    })
    this.token = response.data.CALLINFO.token
    return response
  }

  async loginTotp (
    username: string,
    passphrase: string,
    otp: string
  ): Promise<StoredSafeResponse<StoredSafeLoginData>> {
    this.assertApikeyExists()
    const response = await this.axios.post('/auth', {
      username: username,
      passphrase: passphrase,
      otp: otp,
      logintype: LoginType.TOTP,
      apikey: this.apikey
    })
    this.token = response.data.CALLINFO.token
    return response
  }

  async logout (): Promise<StoredSafeResponse<StoredSafeLogoutData>> {
    this.assertTokenExists()
    const response = await this.axios.get('/auth/logout', {
      headers: { 'X-Http-Token': this.token }
    })
    this.token = undefined
    return response
  }

  async check (): Promise<StoredSafeResponse<StoredSafeCheckData>> {
    this.assertTokenExists()
    return await this.axios.post(
      '/auth/check',
      {},
      { headers: { 'X-Http-Token': this.token } }
    )
  }

  async listVaults (): Promise<StoredSafeResponse<StoredSafeVaultsData>> {
    this.assertTokenExists()
    return await this.axios.get('/vault', {
      headers: { 'X-Http-Token': this.token }
    })
  }

  async vaultObjects (
    id: string | number
  ): Promise<StoredSafeResponse<StoredSafeVaultObjectsData>> {
    this.assertTokenExists()
    return await this.axios.get(`/vault/${id}`, {
      headers: { 'X-Http-Token': this.token }
    })
  }

  async vaultMembers (
    id: string | number
  ): Promise<StoredSafeResponse<StoredSafeVaultMembersData>> {
    this.assertTokenExists()
    return await this.axios.get(`/vault/${id}/members`, {
      headers: { 'X-Http-Token': this.token }
    })
  }

  async createVault (
    params: object
  ): Promise<StoredSafeResponse<StoredSafeVaultData>> {
    this.assertTokenExists()
    return await this.axios.post(
      '/vault',
      { ...params },
      { headers: { 'X-Http-Token': this.token } }
    )
  }

  async editVault (
    id: string | number,
    params: object
  ): Promise<StoredSafeResponse<StoredSafeVaultData>> {
    this.assertTokenExists()
    return await this.axios.put(
      `/vault/${id}`,
      { ...params },
      { headers: { 'X-Http-Token': this.token } }
    )
  }

  async deleteVault (
    id: string | number
  ): Promise<StoredSafeResponse<StoredSafeData>> {
    this.assertTokenExists()
    return await this.axios.delete(`/vault/${id}`, {
      headers: { 'X-Http-Token': this.token }
    })
  }

  async getObject (
    id: string | number,
    children = false
  ): Promise<StoredSafeResponse<StoredSafeObjectData>> {
    this.assertTokenExists()
    return await this.axios.get(`/object/${id}`, {
      params: { children: children },
      headers: { 'X-Http-Token': this.token }
    })
  }

  async decryptObject (
    id: string | number
  ): Promise<StoredSafeResponse<StoredSafeObjectData>> {
    this.assertTokenExists()
    return await this.axios.get(`/object/${id}`, {
      params: { decrypt: true },
      headers: { 'X-Http-Token': this.token }
    })
  }

  async createObject (
    params: object
  ): Promise<StoredSafeResponse<StoredSafeCreateObjectData>> {
    this.assertTokenExists()
    return await this.axios.post(
      '/object',
      { ...params },
      { headers: { 'X-Http-Token': this.token } }
    )
  }

  async editObject (
    id: string | number,
    params: object
  ): Promise<StoredSafeResponse<StoredSafeCreateObjectData>> {
    this.assertTokenExists()
    return await this.axios.put(
      `/object/${id}`,
      { ...params },
      { headers: { 'X-Http-Token': this.token } }
    )
  }

  async deleteObject (
    id: string | number
  ): Promise<StoredSafeResponse<StoredSafeData>> {
    this.assertTokenExists()
    return await this.axios.delete(`/object/${id}`, {
      headers: { 'X-Http-Token': this.token }
    })
  }

  async find (
    needle: string
  ): Promise<StoredSafeResponse<StoredSafeObjectData>> {
    this.assertTokenExists()
    return await this.axios.get('/find', {
      params: { needle: needle },
      headers: { 'X-Http-Token': this.token }
    })
  }

  async listTemplates (): Promise<StoredSafeResponse<StoredSafeTemplateData>> {
    this.assertTokenExists()
    return await this.axios.get('/template', {
      headers: { 'X-Http-Token': this.token }
    })
  }

  async getTemplate (
    id: string | number
  ): Promise<StoredSafeResponse<StoredSafeTemplateData>> {
    this.assertTokenExists()
    return await this.axios.get(`/template/${id}`, {
      headers: { 'X-Http-Token': this.token }
    })
  }

  async statusValues (): Promise<
    StoredSafeResponse<StoredSafeStatusValuesData>
  > {
    this.assertTokenExists()
    return await this.axios.get('/utils/statusvalues', {
      headers: { 'X-Http-Token': this.token }
    })
  }

  async passwordPolicies (): Promise<
    StoredSafeResponse<StoredSafePoliciesData>
  > {
    this.assertTokenExists()
    return await this.axios.get('/utils/policies', {
      headers: { 'X-Http-Token': this.token }
    })
  }

  async version (): Promise<StoredSafeResponse<StoredSafeVersionData>> {
    this.assertTokenExists()
    return await this.axios.get('/utils/version', {
      headers: { 'X-Http-Token': this.token }
    })
  }

  async generatePassword (
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
  ): Promise<StoredSafeResponse<StoredSafePasswordData>> {
    this.assertTokenExists()
    return await this.axios.get('utils/pwgen', {
      headers: { 'X-Http-Token': this.token },
      params
    })
  }
}

export default StoredSafe
