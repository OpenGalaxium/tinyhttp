import { Server, createServer } from 'http'
import { readFile, lstatSync } from 'fs'
import { types } from 'util'

import { ExpressIncomingMessage, ExpressServerResponse, HttpMethods, MiddlewareCallback } from './helpers'

class tinyhttp {
	// routes
	routes = {}
	staticRoutes = []
	middlewares = []

	port: number
	host: string
	server: Server

	constructor() {
		// create server
		this.server = createServer((req: ExpressIncomingMessage, res: ExpressServerResponse) => {
			let data = ''

			req.on('data', (chunk) => {
				data += chunk
			})

			req.on('end', async () => {
				req.body = data
				console.log(`${req.method} ${req.socket.remoteAddress} ${req.url}`)
				let start = Date.now()

				res.send = ExpressServerResponse.prototype.send
				res.json = ExpressServerResponse.prototype.json
				res.render = ExpressServerResponse.prototype.render

				await this.middlewares.reduce((promise, middleware) => promise.then(result => {
					if (types.isNativeError(result)) return Promise.reject(result)

					return new Promise((next, reject) => {
						Promise.resolve(middleware(req, res, next)).catch(reject)
					})
				}), Promise.resolve())

				var route = this.routes[req.url]
				if (route) {
					if (req.method == route.method || route.method == HttpMethods.ALL) {
						try {
							route.callback(req, res)
						} catch (e) {
							res.send('Internal Server Error', 500)
							console.log(`Router: Callback error: ${e}\nStack: ` + e.stack)
						}
					}
					res.end()
				}
				else {
					this.staticRoutes.forEach(route => {
						if (req.url.startsWith(route.path)) {
							if (lstatSync(__dirname + req.url).isDirectory()) req.url += '/index.html'

							readFile(__dirname + req.url, 'utf8', (e, data) => {
								if (!e) {
									res.send(data)
								}
								else {
									console.log(e)
									res.send('Not Found', 404)
								}
								res.end()
							})
						} else {
							res.send('Not Found', 404)
							res.end()
						}
					})
				}
				let end = Date.now()
				console.log(`Request time: ${end - start}ms`)
				return this
			})
		})
	}
	// start server
	async run(port: number, host: string) {
		return new Promise<number>((resolve, reject) => {
			this.port = port
			this.host = host

			this.server.on('error', function (e: Error) {
				reject(e.stack)
			})

			this.server.once('listening', () => {
				resolve(port)
			})

			this.server.listen(this.port, this.host)
		})
	}

	// add new route
	route(url: string, method: HttpMethods, callback: MiddlewareCallback) {
		this.routes[url] = {
			method: HttpMethods[method],
			callback: callback
		}
	}

	// some routes
	all(url: string, callback: MiddlewareCallback) {
		this.route(url, HttpMethods.ALL, callback)
	}
	get(url: string, callback: MiddlewareCallback) {
		this.route(url, HttpMethods.GET, callback)
	}
	post(url: string, callback: MiddlewareCallback) {
		this.route(url, HttpMethods.POST, callback)
	}

	// static
	static(url: string) {
		this.staticRoutes.push({ path: url })
	}

	// middleware
	use(middleware: MiddlewareCallback | Function | tinyhttp) {
		if (typeof middleware != 'function') {
			throw TypeError('middleware must be a function');
		}
		this.middlewares.push(middleware)
	}
}

export default tinyhttp