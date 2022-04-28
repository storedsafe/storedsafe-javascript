/**
 * Describes a request driver used to make requests to StoredSafe.
 *
 * Enables a client to decide which library to use depending on their
 * platform or other needs.
 *
 * Also allows clients to easily customize parameters such as timeout
 * sent with each request.
 *
 * Two simple drivers are provided in this directory:
 *  - FetchDriver:      Uses the fetch library available in browsers
 *  - NodeHTTPDriver:   Uses the NodeJS built-in https library
 */
export interface RequestResponse<ResType = any> {
    status: number
    statusText?: string
    body: string
    response: ResType
}

export interface RequestOptions<OptType = any> {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: object
    headers?: Record<string, string>
    options?: OptType
}

export interface RequestDriver<ResType = any, OptType = any> {
    request(options: RequestOptions<OptType>): Promise<RequestResponse<ResType>>
}