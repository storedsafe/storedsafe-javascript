import type {
  RequestDriver,
  RequestOptions,
  RequestResponse
} from './request-driver.types'

type FetchResponse = RequestResponse<Response>

export class FetchDriver implements RequestDriver<Response, RequestInit> {
  baseInit: RequestInit;

  constructor(init: RequestInit = {}) {
    this.baseInit = init;
  }

  async request({
    url,
    method,
    headers = {},
    data,
    options = {},
  }: RequestOptions<RequestInit>): Promise<FetchResponse> {
    const requestInit: RequestInit = {
      ...this.baseInit,
      ...options,
      headers: {
        ...this.baseInit.headers,
        ...options.headers,
        ...headers,
      },
      method
    }
    if (data && Object.keys(data).length > 0) requestInit.body = JSON.stringify(data)
    const response = await fetch(url, requestInit)
    return {
      status: response.status,
      statusText: response.statusText,
      body: await response.text(),
      response
    }
  }
}