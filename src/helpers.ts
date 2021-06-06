import { readFileSync } from "fs"
import { IncomingMessage, ServerResponse } from "http"

class ExpressIncomingMessage extends IncomingMessage {
    body?: any = {}
}

class ExpressServerResponse extends ServerResponse {
    send?(a, b?: number, c?: object) {
        let headers: any = { 'Content-Type': 'text/html' }
        if (c) headers = c

        let status = 200
        if (b) status = b

        this.writeHead(status, headers)
        let res = a
        if (typeof res === 'object') res = JSON.stringify(res, null, 2)

        this.write(res)
    }

    json?(a, b?) {
        this.send(a, b | 200, { 'Content-Type': 'application/json' })
    }

    render?(a, b) {
        let data = readFileSync(__dirname + '/views/' + a, 'utf8')

        for (var key in b) {
            var re = new RegExp(`{{${key}}}`, 'g')
            data = data.toString().replace(re, b[key])
        }

        this.send(data)
    }
}

enum HttpMethods {
    GET,
    HEAD,
    POST,
    PUT,
    DELETE,
    CONNECT,
    OPTIONS,
    TRACE,
    PATCH,
    ALL
}

type MiddlewareCallback = (req: ExpressIncomingMessage, res: ExpressServerResponse, next?: Function) => void;

export { ExpressIncomingMessage, ExpressServerResponse, HttpMethods, MiddlewareCallback }