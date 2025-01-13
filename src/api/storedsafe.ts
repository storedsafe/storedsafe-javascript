import type {
  StoredSafeResponse,
  StoredSafeLoginData,
  StoredSafeLogoutData,
  StoredSafeCheckData,
  StoredSafeVaultsData,
  StoredSafeVaultObjectsData,
  StoredSafeVaultMembersData,
  StoredSafeVaultData,
  StoredSafeData,
  StoredSafeErrorData,
  StoredSafeObjectData,
  StoredSafeCreateObjectData,
  StoredSafeTemplateData,
  StoredSafeStatusValuesData,
  StoredSafePoliciesData,
  StoredSafeVersionData,
  StoredSafePasswordData,
  StoredSafeCreateUserData,
  StoredSafeUsersData
} from './storedsafe.types'
import type {
  RequestDriver,
  RequestResponse
} from '../drivers';

export enum LoginType {
  YUBIKEY = 'yubikey-otp',
  TOTP = 'totp',
  SMARTCARD = 'smartcard'
}

/**
 * Wrapper for the StoredSafe REST-like API.
 * 
 * API documentation at: https://developer.storedsafe.com/
 * 
 * @author Oscar Mattsson
 */
export class StoredSafe<ResType = any, OptType = any> {
  static default_driver: RequestDriver

  host?: string
  apikey?: string
  token?: string
  _version: string
  driver: RequestDriver<ResType, OptType>

  constructor(
    { host, apikey, token }: { host: string; apikey?: string; token?: string },
    version = '1.0',
    driver: RequestDriver<ResType, OptType> = StoredSafe.default_driver
  ) {
    this.host = host
    this.apikey = apikey
    this.token = token
    this._version = version
    this.driver = driver
  }

  private assertApikeyExists(): void {
    if (this.apikey === undefined) {
      throw new Error('Path requires apikey, apikey is undefined.')
    }
  }

  private assertTokenExists(): void {
    if (this.token === undefined) {
      throw new Error('Path requires token, token is undefined.')
    }
  }

  private async parseResponse(response: RequestResponse<ResType>): Promise<StoredSafeResponse<any, ResType>> {
    try {
      const data: StoredSafeErrorData = JSON.parse(response.body)
      const errorNo = data.CALLINFO?.errors ?? 0
      const errorCodeNo = data.CALLINFO?.errorcodes ?? 0
      const res: StoredSafeResponse<StoredSafeData, ResType> = {
        ...response,
        hasErrors: errorNo + errorCodeNo > 0,
        unauthorized: [401, 403].includes(response.status),
        errors: data.ERRORS ?? [],
        errorcodes: data.ERRORCODES ?? {},
        success: data.CALLINFO?.status == 'SUCCESS',
        data
      }
      return res
    } catch (error) {
      const res: StoredSafeResponse<StoredSafeData, ResType> = {
        ...response,
        success: false,
        errors: [(error as Error)?.message]
      }
      return res
    }
  }

  private parseQueryParams(queryParams: Record<string, any>): string {
    return Object.keys(queryParams).map((key: string) => (
      `${key}=${queryParams[key]}`
    )).join('&')
  }

  /**
   * Send a fetch request.
   * Browser only, mtls relies on browser supplying the client certificate.
   * @param path Path relative to API root
   * @param init Fetch config
   * @param mtls Use mtls port if enabled.
   */
  private async request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    headers: Record<string, any> = {},
    queryParams: Record<string, any> = {},
    data?: object,
    options?: OptType,
    mtls: boolean = false
  ): Promise<StoredSafeResponse<any>> {
    path = path.replace(/^\//, '')
    const host = this.host + (mtls ? ':8443' : '')
    const urlSearchParams = this.parseQueryParams(queryParams)
    const url = `https://${host}/api/${this._version}/${path}${urlSearchParams ? '?' + urlSearchParams : ''}`
    return this.parseResponse(await this.driver.request({
      url,
      method,
      headers,
      data,
      options,
    }))
  }

  private async get(
    path: string,
    options?: OptType,
    params: {
      headers?: Record<string, any>,
      queryParams?: Record<string, any>
    } = {},
    mtls: boolean = false
  ): Promise<StoredSafeResponse<any>> {
    return this.request(
      'GET',
      path,
      params.headers ?? {},
      params.queryParams ?? {},
      undefined,
      options,
      mtls
    )
  }

  private async post(
    path: string,
    options?: OptType,
    params: {
      headers?: Record<string, any>,
      queryParams?: Record<string, any>,
      data?: object
    } = {},
    mtls: boolean = false
  ): Promise<StoredSafeResponse<any>> {
    return this.request(
      'POST',
      path,
      params.headers ?? {},
      params.queryParams ?? {},
      params.data ?? {},
      options,
      mtls
    )
  }

  private async put(
    path: string,
    options?: OptType,
    params: {
      headers?: Record<string, any>,
      queryParams?: Record<string, any>,
      data?: object
    } = {},
    mtls: boolean = false
  ): Promise<StoredSafeResponse<any>> {
    return this.request(
      'PUT',
      path,
      params.headers ?? {},
      params.queryParams ?? {},
      params.data ?? {},
      options,
      mtls
    )
  }

  private async delete(
    path: string,
    options?: OptType,
    params: {
      headers?: Record<string, any>,
      queryParams?: Record<string, any>
    } = {},
    mtls: boolean = false
  ): Promise<StoredSafeResponse<any>> {
    return this.request(
      'DELETE',
      path,
      params.headers ?? {},
      params.queryParams ?? {},
      undefined,
      options,
      mtls
    )
  }

  async loginYubikey(
    username: string,
    passphrase: string,
    otp: string,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeLoginData>> {
    this.assertApikeyExists()
    const response = await this.post('/auth', options, {
      data: {
        username: username,
        keys: `${passphrase}${this.apikey}${otp}`,
      }
    })
    this.token = response.data.CALLINFO.token
    return response
  }

  async loginTotp(
    username: string,
    passphrase: string,
    otp: string,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeLoginData>> {
    this.assertApikeyExists()
    const response = await this.post('/auth', options, {
      data: {
        username: username,
        passphrase: passphrase,
        otp: otp,
        logintype: LoginType.TOTP,
        apikey: this.apikey
      }
    })
    this.token = response.data.CALLINFO.token
    return response
  }

  async loginSmartCard(
    username: string,
    passphrase: string,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeLoginData>> {
    this.assertApikeyExists()
    const response = await this.post('/auth', options, {
      data: {
        username: username,
        passphrase: passphrase,
        logintype: LoginType.SMARTCARD,
        apikey: this.apikey
      }
    }, true)
    this.token = response.data.CALLINFO.token
    return response
  }

  async logout(
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeLogoutData>> {
    this.assertTokenExists()
    const response = await this.get('/auth/logout', options, {
      headers: { 'X-Http-Token': this.token as string }
    })
    this.token = undefined
    return response
  }

  async check(
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeCheckData>> {
    this.assertTokenExists()
    return await this.post('/auth/check', options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async listVaults(
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeVaultsData>> {
    this.assertTokenExists()
    return await this.get('/vault', options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async vaultObjects(
    id: string | number,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeVaultObjectsData>> {
    this.assertTokenExists()
    return await this.get(`/vault/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async vaultMembers(
    id: string | number,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeVaultMembersData>> {
    this.assertTokenExists()
    return await this.get(`/vault/${id}/members`, options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async createVault(
    params: object,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeVaultData>> {
    this.assertTokenExists()
    return await this.post('/vault', options, {
      headers: { 'X-Http-Token': this.token as string },
      data: params
    })
  }

  async editVault(
    id: string | number,
    params: object,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeVaultData>> {
    this.assertTokenExists()
    return await this.put(`/vault/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string },
      data: params
    })
  }

  async deleteVault(
    id: string | number,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeData>> {
    this.assertTokenExists()
    return await this.delete(`/vault/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async getObject(
    id: string | number,
    children = false,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeObjectData>> {
    this.assertTokenExists()
    return await this.get(`/object/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string },
      queryParams: { children: children }
    })
  }

  async decryptObject(
    id: string | number,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeObjectData>> {
    this.assertTokenExists()
    return await this.get(`/object/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string },
      queryParams: { decrypt: true }
    })
  }

  async getFile(
    id: string | number,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeObjectData>> {
    this.assertTokenExists()
    return await this.get(`/object/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string },
      queryParams: { filedata: true }
    })
  }

  async createObject(
    params: object,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeCreateObjectData>> {
    this.assertTokenExists()
    return await this.post('/object', options, {
      headers: { 'X-Http-Token': this.token as string },
      data: params
    })
  }

  async editObject(
    id: string | number,
    params: object,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeCreateObjectData>> {
    this.assertTokenExists()
    return await this.put(`/object/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string },
      data: params
    })
  }

  async deleteObject(
    id: string | number,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeData>> {
    this.assertTokenExists()
    return await this.delete(`/object/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async find(
    needle: string,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeObjectData>> {
    this.assertTokenExists()
    return await this.get('/find', options, {
      headers: { 'X-Http-Token': this.token as string },
      queryParams: { needle: needle }
    })
  }

  async listTemplates(
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeTemplateData>> {
    this.assertTokenExists()
    return await this.get('/template', options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async getTemplate(
    id: string | number,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeTemplateData>> {
    this.assertTokenExists()
    return await this.get(`/template/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async listUsers(
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeUsersData>> {
    this.assertTokenExists()
    return await this.get('/user', options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async getUser(
    id: string | number,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeUsersData>> {
    this.assertTokenExists()
    return await this.get(`/user/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async createUser(
    params: object,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeCreateUserData>> {
    this.assertTokenExists()
    return await this.post('/user', options, {
      headers: { 'X-Http-Token': this.token as string },
      data: params
    })
  }

  async deleteUser(
    id: string | number,
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeCreateUserData>> {
    this.assertTokenExists()
    return await this.delete(`/user/${id}`, options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async statusValues(
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeStatusValuesData>> {
    this.assertTokenExists()
    return await this.get('/utils/statusvalues', options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async passwordPolicies(
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafePoliciesData>> {
    this.assertTokenExists()
    return await this.get('/utils/policies', options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async version(
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafeVersionData>> {
    this.assertTokenExists()
    return await this.get('/utils/version', options, {
      headers: { 'X-Http-Token': this.token as string }
    })
  }

  async generatePassword(
    params: {
      type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin' | 'bytes'
      length?: number
      language?: 'en_US' | 'sv_SE'
      delimeter?: string
      words?: number
      min_char?: number
      max_char?: number
      policyid?: number | string
    } = {},
    options?: OptType
  ): Promise<StoredSafeResponse<StoredSafePasswordData>> {
    this.assertTokenExists()
    return await this.get('utils/pwgen', options, {
      headers: { 'X-Http-Token': this.token as string },
      queryParams: params
    })
  }
}

export default StoredSafe