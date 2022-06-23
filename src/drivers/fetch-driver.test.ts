import { FetchDriver } from "./fetch-driver"

const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
global.fetch = fetchMock

let driver: FetchDriver
const init: RequestInit = Object.freeze({
  headers: {
    'x-init-header': 'value', // Unique header
    'x-common-header': 'base' // Will be overwritten
  }
})

const requestInit: RequestInit = Object.freeze({
  headers: {
    'x-request-header': 'value', // Unique header
    'x-common-header': 'request' // Overwrites base
  }
})

const url = 'https://example.com'

function mockFetch({
  data, status, statusText
}: {
  data?: Record<string, any>
  status: number
  statusText: string
}): Response {
  const response: Response = {
    status,
    statusText,
    text: () => Promise.resolve<string>(JSON.stringify(data))
  } as any as Response
  const mockFn = (
    input: RequestInfo | URL, init?: RequestInit
  ): Promise<Response> => Promise.resolve(response)
  fetchMock.mockImplementationOnce(mockFn)
  return response
}

describe('Create fetch driver', () => {
  test('Empty constructor', () => {
    driver = new FetchDriver()
    expect(driver.baseInit).toEqual({})
  })

  test('With empty baseInit', () => {
    const baseInit = Object.freeze({})
    driver = new FetchDriver(baseInit)
    expect(driver.baseInit).toBe(baseInit)
  })

  test('With config', () => {
    const baseInit: RequestInit = Object.freeze({
      headers: { 'x-my-header': 'value' }
    })
    driver = new FetchDriver(baseInit)
    expect(driver.baseInit).toBe(baseInit)
  })
})

describe('Basic requests', () => {
  beforeEach(() => {
    driver = new FetchDriver()
  })

  afterEach(() => {
    fetchMock.mockClear()
  })

  test('GET request', async () => {
    const mockRes = mockFetch({
      status: 200,
      statusText: 'OK'
    })
    const res = await driver.request({
      url,
      method: "GET",
    })
    expect(fetchMock).toHaveBeenLastCalledWith(url, {
      headers: {},
      method: "GET"
    })
    expect(res.body).toEqual(undefined)
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('OK')
    expect(res.response).toBe(mockRes)
  })

  test('POST request', async () => {
    const mockRes = mockFetch({
      data: { foo: 'bar' },
      status: 200,
      statusText: 'OK'
    })
    const res = await driver.request({
      url,
      method: "POST",
    })
    expect(fetchMock).toHaveBeenLastCalledWith(url, {
      headers: {},
      method: "POST"
    })
    expect(res.body).toEqual(JSON.stringify({ foo: 'bar' }))
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('OK')
    expect(res.response).toBe(mockRes)
  })
})

describe('Request parameters', () => {
  beforeEach(() => {
    driver = new FetchDriver(init)
  })

  afterEach(() => {
    fetchMock.mockClear()
  })

  test('Base options', async () => {
    const mockRes = mockFetch({
      data: { foo: 'bar' },
      status: 200,
      statusText: 'OK'
    })
    const res = await driver.request({
      url,
      method: "GET"
    })
    expect(fetchMock).toHaveBeenLastCalledWith(url, {
      headers: {
        'x-init-header': 'value',
        'x-common-header': 'base'
      },
      method: "GET",
    })
    expect(res.body).toEqual(JSON.stringify({ foo: 'bar' }))
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('OK')
    expect(res.response).toBe(mockRes)
  })

  test('Overwrite options', async () => {
    const mockRes = mockFetch({
      data: { foo: 'bar' },
      status: 200,
      statusText: 'OK'
    })
    const res = await driver.request({
      url,
      method: "GET",
      options: requestInit
    })
    expect(fetchMock).toHaveBeenLastCalledWith(url, {
      headers: {
        'x-init-header': 'value',
        'x-request-header': 'value',
        'x-common-header': 'request'
      },
      method: "GET",
    })
    expect(res.body).toEqual(JSON.stringify({ foo: 'bar' }))
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('OK')
    expect(res.response).toBe(mockRes)
  })

  test('Overwrite headers', async () => {
    const mockRes = mockFetch({
      data: { foo: 'bar' },
      status: 200,
      statusText: 'OK'
    })
    const res = await driver.request({
      url,
      method: "GET",
      options: requestInit,
      headers: {
        'x-headers-header': 'value',
        'x-common-header': 'headers'
      }
    })
    expect(fetchMock).toHaveBeenLastCalledWith(url, {
      headers: {
        'x-init-header': 'value',
        'x-request-header': 'value',
        'x-headers-header': 'value',
        'x-common-header': 'headers'
      },
      method: "GET",
    })
    expect(res.body).toEqual(JSON.stringify({ foo: 'bar' }))
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('OK')
    expect(res.response).toBe(mockRes)
  })
})