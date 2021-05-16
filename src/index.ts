import { Server, createServer } from 'http'
import { readFile, lstatSync } from 'fs'
import { types } from 'util'

// routes
let routes = {}
let staticRoutes = []
let middlewares = []

import { ExpressIncomingMessage, ExpressServerResponse, methods } from './helpers'
// all http methods

class tinyhttp {
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
				console.log(data)
				console.log(`${req.method} ${req.socket.remoteAddress} ${req.url}`)
				let start = Date.now()

				res.send = ExpressServerResponse.prototype.send
				res.json = ExpressServerResponse.prototype.json
				res.render = ExpressServerResponse.prototype.render

				await middlewares.reduce((promise, middleware) => promise.then(result => {
					if (types.isNativeError(result)) return Promise.reject(result)

					return new Promise((next, reject) => {
						Promise.resolve(middleware(req, res, next)).catch(reject)
					})
				}), Promise.resolve())

				var route = routes[req.url]
				if (route) {
					if (req.method == route.method || route.method == methods.ALL) {
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
					staticRoutes.forEach(route => {
						if (req.url.startsWith(route.path)) {
							if (lstatSync(__dirname + req.url).isDirectory()) req.url += '/index.html'

							readFile(__dirname + req.url, (e, data) => {
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
	run(port: number, host: string, callback: (host: string, port: number) => void) {
		this.port = port
		this.host = host

		this.server.on('error', function (e: Error) {
			console.log(e.stack)
		})

		this.server.once('listening', () => {
			callback(this.host, this.port)
		})

		this.server.listen(this.port, this.host)
	}

	// add new route
	route(url: string, method: methods, callback: Function = function (req: ExpressIncomingMessage, res: ExpressServerResponse) { }) {
		routes[url] = {
			method: methods[method],
			callback: callback
		}
	}

	// some routes
	all(url: string, callback: Function = function (req: ExpressIncomingMessage, res: ExpressServerResponse) { }) {
		this.route(url, methods.ALL, callback)
	}
	get(url: string, callback: Function = function (req: ExpressIncomingMessage, res: ExpressServerResponse) { }) {
		this.route(url, methods.GET, callback)
	}
	post(url: string, callback: Function = function (req: ExpressIncomingMessage, res: ExpressServerResponse) { }) {
		this.route(url, methods.POST, callback)
	}

	// static
	static(url: string) {
		staticRoutes.push({ path: url })
	}

	// middleware
	use(middleware: any) {
		if (typeof middleware != 'function') {
			throw TypeError('middleware must be a \'function\'')
		}
		middlewares.push(middleware)
	}
}

export default tinyhttp