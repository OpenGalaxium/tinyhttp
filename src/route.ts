import { MiddlewareCallback } from "./helpers";

export default class Route {
    url: string
    method: string
    callback: MiddlewareCallback

    constructor(url: string, method: string, callback: MiddlewareCallback) {
        this.url = url
        this.method = method
        this.callback = callback
    }
}