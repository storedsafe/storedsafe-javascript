import type {
    RequestDriver,
    RequestOptions,
    RequestResponse
} from './request-driver.types'
import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';

/**
 * @param agentOptions Options for http agent or false for global agent
 * @param requestOptions Options sent with each request
 */
interface NodeDriverInit {
    agent?: https.Agent | https.AgentOptions | false
    requestOptions?: https.RequestOptions
}

type PromiseCallback<T> = (
    resolve: (value: T) => void,
    reject: (reason?: any) => void
) => void

type NodeResponse = RequestResponse<IncomingMessage>;

export class NodeDriver implements RequestDriver<IncomingMessage, https.RequestOptions> {
    agent: https.Agent;
    requestOptions: https.RequestOptions;

    constructor({ agent, requestOptions }: NodeDriverInit = { agent: false }) {
        if (agent instanceof https.Agent) {
            this.agent = agent
        }
        else if (agent != false) {
            this.agent = new https.Agent(agent)
        }
        else {
            this.agent = https.globalAgent
        }
        this.requestOptions = requestOptions ?? {}
    }

    handleRequest(request: ClientRequest): PromiseCallback<NodeResponse> {
        return (resolve, reject) => {
            request.on('response', (response) => {
                response.on('data', (data) => {
                    resolve({
                        status: response.statusCode as number,
                        statusText: response.statusMessage,
                        body: data,
                        response
                    })
                })
            })
            request.on('error', reject)
        }
    }

    async request({
        url,
        method,
        data,
        headers,
        options = {},
    }: RequestOptions<https.RequestOptions>): Promise<NodeResponse> {
        const requestOptions: https.RequestOptions = {
            ...this.requestOptions,
            ...options,
            headers: {
                ...this.requestOptions?.headers,
                ...options?.headers,
                ...headers,
            },
            method,
        }
        const request = https.request(url, requestOptions)
        request.write(JSON.stringify(data))
        request.end();
        return await new Promise(this.handleRequest(request))
    }
}