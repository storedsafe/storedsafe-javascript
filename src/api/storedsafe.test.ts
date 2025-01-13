import type {
  RequestDriver,
  RequestOptions,
  RequestResponse
} from '../drivers/request-driver.types'

interface TestDriverMockParams {
  path: string
  method: string
  data?: Record<string, any>
  query?: Record<string, any>
  headers: Record<string, any>
  status: number
  statusText?: string
  options: any
  body: string
}

export default class TestDriver implements RequestDriver {
  url: string
  apikey?: string
  token?: string
  options: TestDriverMockParams | null = null

  constructor({ url, apikey, token }: { url: string, apikey?: string, token?: string }) {
    this.url = url
    this.apikey = apikey
    this.token = token
  }

  mock(params: Partial<TestDriverMockParams>) {
    this.options = {
      ...params,
      options: params.options ?? {},
      headers: params.headers ?? {},
      path: params.path ?? '/',
      method: params.method ?? 'GET',
      status: params.status ?? 200,
      body: params.body ?? '',
    }
  }

  reset() {
    this.options = null
  }

  parseUrl(path: string, query?: Record<string, any>) {
    if (!query) return this.url + path
    let queryString = '?' +
      Object.keys(query).map(key => `${key}=${query[key]}`).join('&')
    return this.url + path + queryString
  }

  async request({
    url,
    method,
    headers,
    data,
    options = {},
  }: RequestOptions): Promise<RequestResponse> {
    if (this.options == null) throw new Error("[TestDriver] No mock parameters set.")
    expect(url).toEqual(this.parseUrl(this.options.path, this.options.query))
    expect(method).toEqual(this.options.method)
    expect(data).toEqual(this.options.data)
    expect(headers).toEqual(this.options.headers)
    expect(options).toEqual(this.options.options)
    try {
      const response: RequestResponse = {
        status: this.options.status,
        statusText: this.options.statusText,
        body: this.options.body,
        response: undefined
      }
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject(error)
    } finally {
      this.reset()
    }
  }
}

import StoredSafe, { LoginType } from './storedsafe'

// Sample StoredSafe configuration
const host = 'example.storedsafe.com'
const apikey = 'A1B2C3D4'
const token = 'abcde12345'
const version = '1.0'
const url = `https://${host}/api/${version}`
const url_mtls = `https://${host}:8443/api/${version}`

// Sample credentials
const username = 'JohnDoe'
const passphrase = 'p4ssw0rd'
const otp = '978675'
const keys = `${passphrase}${apikey}${otp}`

// Sample request reply data
const replySuccess = Object.freeze({
  CALLINFO: { token: token }
})

// Sample parameters
const id = "1789"
const needle = 'waldo'
const params = Object.freeze({
  name: 'newname',
})

// Declare storedsafe object variable (initialized in beforeEach)
let storedsafe: StoredSafe

const driver = new TestDriver({ url, apikey, token })
const mtls_driver = new TestDriver({ url: url_mtls, apikey, token })

describe("before authentication", () => {
  beforeEach(() => {
    storedsafe = new StoredSafe({ host, apikey }, '1.0', driver)
  })

  test(".loginYubikey, sets token", async () => {
    driver.mock({
      path: '/auth',
      method: 'POST',
      data: { username, keys },
      status: 201,
      body: JSON.stringify(replySuccess)
    })
    const res = await storedsafe.loginYubikey(username, passphrase, otp)
    expect(res.status).toBe(201)
    expect(storedsafe.token).toBe(token)
  })

  test(".loginTotp, sets token", async () => {
    driver.mock({
      path: '/auth',
      method: 'POST',
      data: {
        username: username,
        passphrase: passphrase,
        otp: otp,
        apikey: apikey,
        logintype: LoginType.TOTP,
      },
      status: 201,
      body: JSON.stringify(replySuccess)
    })
    const res = await storedsafe.loginTotp(username, passphrase, otp)
    expect(res.status).toBe(201)
    expect(storedsafe.token).toBe(token)
  })
})

describe("before authentication, using mtls", () => {
  beforeEach(() => {
    storedsafe = new StoredSafe({ host, apikey }, '1.0', mtls_driver)
  })

  test(".loginSmartCard, sets token", async () => {
    mtls_driver.mock({
      path: '/auth',
      method: 'POST',
      data: {
        username: username,
        passphrase: passphrase,
        apikey: apikey,
        logintype: LoginType.SMARTCARD,
      },
      status: 201,
      body: JSON.stringify(replySuccess)
    })
    const res = await storedsafe.loginSmartCard(username, passphrase)
    expect(res.status).toBe(201)
    expect(storedsafe.token).toBe(token)
  })
})

describe("after authentication", () => {
  beforeEach(() => {
    storedsafe = new StoredSafe({ host, token }, '1.0', driver)
  })

  describe("/auth", () => {
    test(".logout, removes token", async () => {
      driver.mock({
        path: '/auth/logout',
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      const res = await storedsafe.logout()
      expect(res.status).toBe(200)
      expect(storedsafe.token).toBe(undefined)
    })

    test(".check", async () => {
      driver.mock({
        path: '/auth/check',
        method: 'POST',
        data: {},
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      const res = await storedsafe.check()
      expect(res.status).toBe(200)
    })
  }) // END AUTH

  describe("/vault", () => {
    test(".listVaults", async () => {
      driver.mock({
        path: '/vault',
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      const res = await storedsafe.listVaults()
      expect(res.status).toBe(200)
    })

    test(".vaultObjects", () => {
      driver.mock({
        path: `/vault/${id}`,
        method: 'GET',
        headers: {
          'X-Http-Token': token,
        },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.vaultObjects(id)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".vaultMembers", () => {
      driver.mock({
        path: `/vault/${id}/members`,
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.vaultMembers(id)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".createVault", () => {
      driver.mock({
        path: '/vault',
        data: params,
        method: 'POST',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.createVault(params)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".editVault", () => {
      driver.mock({
        path: `/vault/${id}`,
        data: params,
        method: 'PUT',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.editVault(id, params)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".deleteVault", () => {
      driver.mock({
        path: `/vault/${id}`,
        method: 'DELETE',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.deleteVault(id)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })
  }) // END VAULT

  describe("/object", () => {
    test(".object, default (no children)", () => {
      driver.mock({
        path: `/object/${id}`,
        method: 'GET',
        query: { children: false },
        headers: { 'X-Http-Token': token, },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.getObject(id)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".object, no children", () => {
      driver.mock({
        path: `/object/${id}`,
        method: 'GET',
        query: { children: false },
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.getObject(id, false)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".object, with children", () => {
      driver.mock({
        path: `/object/${id}`,
        method: 'GET',
        query: { children: true },
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.getObject(id, true)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".decryptObject", () => {
      driver.mock({
        path: `/object/${id}`,
        method: 'GET',
        query: { decrypt: true },
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.decryptObject(id)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".createObject", () => {
      driver.mock({
        path: `/object`,
        data: params,
        method: 'POST',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.createObject(params)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".editObject", () => {
      driver.mock({
        path: `/object/${id}`,
        data: params,
        method: 'PUT',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.editObject(id, params)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".deleteObject", () => {
      driver.mock({
        path: `/object/${id}`,
        method: 'DELETE',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.deleteObject(id)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })
  }) // END OBJECT

  describe("/find", () => {
    test(".find", () => {
      driver.mock({
        path: '/find' + `?needle=${needle}`,
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.find(needle)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })
  }) // END FIND

  describe("/template", () => {
    test(".listTemplates", () => {
      driver.mock({
        path: '/template',
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.listTemplates()
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".getTemplate", () => {
      driver.mock({
        path: `/template/${id}`,
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.getTemplate(id)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })
  }) // END TEMPLATE

  describe("/user", () => {
    test(".listUsers", () => {
      driver.mock({
        path: '/user',
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.listUsers()
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".getUser", () => {
      driver.mock({
        path: `/user/${id}`,
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.getUser(id)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".createUser", () => {
      driver.mock({
        path: `/user`,
        data: params,
        method: 'POST',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.createUser(params)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".deleteUser", () => {
      driver.mock({
        path: `/user/${id}`,
        method: 'DELETE',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.deleteUser(id)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })
  }) // END USER

  describe("/utils", () => {
    test(".statusValues", () => {
      driver.mock({
        path: '/utils/statusvalues',
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.statusValues()
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".passwordPolicies", () => {
      driver.mock({
        path: '/utils/policies',
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.passwordPolicies()
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".version", () => {
      driver.mock({
        path: '/utils/version',
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.version()
        .then(res => {
          expect(res.status).toBe(200)
        })
    })

    test(".generatePassword", () => {
      driver.mock({
        path: '/utils/pwgen',
        method: 'GET',
        headers: { 'X-Http-Token': token },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.generatePassword()
        .then(res => {
          expect(res.status).toBe(200)
        })
    })
    test(".generatePassword", () => {
      const params: {
        type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin'
        length?: number
        language?: 'en_US' | 'sv_SE'
        delimeter?: string
        words?: number
        min_char?: number
        max_char?: number
        policyid?: string
      } = {
        type: 'pin',
        length: 10,
        language: 'sv_SE',
        delimeter: '-',
        words: 4,
        min_char: 8,
        max_char: 16,
        policyid: '7',
      }
      driver.mock({
        path: '/utils/pwgen',
        query: params,
        method: 'GET',
        headers: {
          'X-Http-Token': token,
        },
        status: 200,
        body: JSON.stringify(replySuccess)
      })
      return storedsafe.generatePassword(params)
        .then(res => {
          expect(res.status).toBe(200)
        })
    })
  }) // END UTILS
})

