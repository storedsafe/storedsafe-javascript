import { ClientRequest, IncomingMessage } from 'http'

// Needs to be defined before https imports because jest.mock is hoisted

const mockRequestError = jest.fn<void, [(reason?: any) => void]>()
const mockResponseOn = jest.fn<void, [
  event: string, listener: (data: any) => void
]>((event, listener) => {
  if (event === 'data') {
    listener(undefined)
  }
})
const mockRequestOn = jest.fn<
  void, [event: string, listener: (param: any) => void]
>()

interface MockResponse {
  statusCode: number
  statusMessage: string
  [key: string]: any
}

function mockResponse(response: MockResponse) {
  mockRequestWrite.mockImplementationOnce((data: any) => {
    mockResponseOn.mockImplementationOnce((event, listener) => {
      if (event === 'data') {
        listener(data)
      }
    })
  })
  mockRequestOn.mockImplementationOnce((event, listener) => {
    if (event === 'response') {
      listener({
        ...response,
        on: mockResponseOn
      } as any as IncomingMessage)
    }
  })
  mockRequestOn.mockImplementationOnce((event, listener) => {
    if (event === 'error') {
      mockRequestError(listener)
    }
  })
}

const mockRequestWrite = jest.fn()
const mockRequestEnd = jest.fn()

const mockHttpsRequest = jest.fn<
  ClientRequest, [string, https.RequestOptions]
>((_url, _options) => {
  return {
    write: mockRequestWrite,
    on: mockRequestOn,
    end: mockRequestEnd,
  } as any as ClientRequest
})

jest.mock('https', () => ({
  ...jest.requireActual<object>('https'),
  request: mockHttpsRequest,
  globalAgent: { agent: 'global' },
  Agent: jest.fn((options: https.AgentOptions) => ({
    agent: 'custom',
    ...options
  }))
}))

import https from 'https'
import { NodeDriver } from "./node-driver"

let driver: NodeDriver
const init: https.RequestOptions = Object.freeze({
  headers: {
    'x-init-header': 'value', // Unique header
    'x-common-header': 'base' // Will be overwritten
  }
})

const requestInit: https.RequestOptions = Object.freeze({
  headers: {
    'x-request-header': 'value', // Unique header
    'x-common-header': 'request' // Overwrites base
  }
})

const url = 'https://example.com'

function expectRequestFlow(data: any) {
  expect(mockRequestWrite).toHaveBeenCalledWith(JSON.stringify(data))
  expect(mockRequestEnd).toHaveBeenCalled()
  expect(mockRequestOn).toHaveBeenNthCalledWith(1, 'response', expect.any(Function))
  expect(mockRequestOn).toHaveBeenNthCalledWith(2, 'error', expect.any(Function))
  expect(mockRequestError).toHaveBeenCalledWith(expect.any(Function))
  expect(mockResponseOn).toHaveBeenCalledWith('data', expect.any(Function))
}

function expectRequestFlowNoData() {
  expect(mockRequestWrite).not.toHaveBeenCalled()
  expect(mockRequestEnd).toHaveBeenCalled()
  expect(mockRequestOn).toHaveBeenNthCalledWith(1, 'response', expect.any(Function))
  expect(mockRequestOn).toHaveBeenNthCalledWith(2, 'error', expect.any(Function))
  expect(mockRequestError).toHaveBeenCalledWith(expect.any(Function))
  expect(mockResponseOn).toHaveBeenCalledWith('data', expect.any(Function))
}

describe('Create node https driver', () => {
  test('Empty constructor', () => {
    driver = new NodeDriver()
    expect(driver.agent).toBe(https.globalAgent)
    expect(driver.requestOptions).toEqual({})
  })

  test('With empty options', () => {
    const requestOptions = Object.freeze({})
    driver = new NodeDriver({ requestOptions })
    expect(driver.agent).toBe(https.globalAgent)
    expect(driver.requestOptions).toBe(requestOptions)
  })

  test('With options', () => {
    const requestOptions: https.RequestOptions = Object.freeze({
      headers: { 'x-my-header': 'value' }
    })
    driver = new NodeDriver({ requestOptions })
    expect(driver.requestOptions).toBe(requestOptions)
  })
})

describe('basic requests', () => {
  beforeEach(() => {
    driver = new NodeDriver()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('GET request', async () => {
    const mockRes: MockResponse = Object.freeze({
      statusCode: 200,
      statusMessage: 'ok'
    })
    mockResponse(mockRes)
    const res = await driver.request({
      url,
      method: "GET",
    })
    expect(mockHttpsRequest).toHaveBeenLastCalledWith(url, {
      headers: {},
      method: "GET"
    })
    expectRequestFlowNoData()
    expect(res.body).toEqual(undefined)
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('ok')
    expect(res.response).toEqual(expect.objectContaining(mockRes))
  })

  test('POST request', async () => {
    const mockData = { foo: 'bar' }
    const mockRes: MockResponse = {
      statusCode: 200,
      statusMessage: 'ok'
    }
    mockResponse(mockRes)
    const res = await driver.request({
      url,
      method: "POST",
      data: mockData
    })
    expect(mockHttpsRequest).toHaveBeenLastCalledWith(url, {
      headers: {},
      method: "POST"
    })
    expectRequestFlow(mockData)
    expect(res.body).toEqual(JSON.stringify(mockData))
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('ok')
    expect(res.response).toEqual(expect.objectContaining(mockRes))
  })
})

describe('Request parameters', () => {
  beforeEach(() => {
    driver = new NodeDriver({ requestOptions: init })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Base options', async () => {
    const mockRes: MockResponse = {
      statusCode: 200,
      statusMessage: 'ok'
    }
    mockResponse(mockRes)
    const res = await driver.request({
      url,
      method: "GET",
    })
    expect(mockHttpsRequest).toHaveBeenLastCalledWith(url, {
      headers: {
        'x-init-header': 'value',
        'x-common-header': 'base'
      },
      method: "GET"
    })
    expectRequestFlowNoData()
    expect(res.body).toEqual(undefined)
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('ok')
    expect(res.response).toEqual(expect.objectContaining(mockRes))
  })

  test('Overwrite options', async () => {
    const mockRes: MockResponse = {
      statusCode: 200,
      statusMessage: 'ok'
    }
    mockResponse(mockRes)
    const res = await driver.request({
      url,
      method: "GET",
      options: requestInit
    })
    expect(mockHttpsRequest).toHaveBeenLastCalledWith(url, {
      headers: {
        'x-init-header': 'value',
        'x-request-header': 'value',
        'x-common-header': 'request'
      },
      method: "GET"
    })
    expectRequestFlowNoData()
    expect(res.body).toEqual(undefined)
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('ok')
    expect(res.response).toEqual(expect.objectContaining(mockRes))
  })

  test('Overwrite headers', async () => {
    const mockRes: MockResponse = {
      statusCode: 200,
      statusMessage: 'ok'
    }
    mockResponse(mockRes)
    const res = await driver.request({
      url,
      method: "GET",
      options: requestInit,
      headers: {
        'x-headers-header': 'value',
        'x-common-header': 'headers'
      }
    })
    expect(mockHttpsRequest).toHaveBeenLastCalledWith(url, {
      headers: {
        'x-init-header': 'value',
        'x-request-header': 'value',
        'x-headers-header': 'value',
        'x-common-header': 'headers'
      },
      method: "GET"
    })
    expectRequestFlowNoData()
    expect(res.body).toEqual(undefined)
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('ok')
    expect(res.response).toEqual(expect.objectContaining(mockRes))
  })
})
