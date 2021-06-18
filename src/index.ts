import { Server, createServer } from 'http'
import { readFile, lstat } from 'fs/promises'
import { types } from 'util'

import { ExpressIncomingMessage, ExpressServerResponse, HttpMethods, MiddlewareCallback, ErrorHandler } from './helpers'
import parser from './parser'
import Route from './route'

type tinyhttpParams = {
	log?: boolean
}

class tinyhttp {
	// routes
	routes: Route[] = []
	staticRoutes = []
	middlewares = []
	errorHandler: ErrorHandler

	port: number
	host: string
	server: Server

	// params
	log = false

	constructor(params?: tinyhttpParams) {
		if (params) {
			if (params.log) this.log = true
		}
		// create server
		this.server = createServer((req: ExpressIncomingMessage, res: ExpressServerResponse) => {
			let data = ''

			req.on('data', (chunk) => {
				data += chunk
			})

			req.on('end', async () => {
				req.body = data
				if (this.log) console.log(`${req.method} ${req.socket.remoteAddress} ${req.url}`)
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

				// finding route
				for (let _route of this.routes) {
					if (_route.url == req.url)
						if (_route.method == req.method || _route.method == HttpMethods[HttpMethods.ALL])
							var route = _route
				}

				let ended = false

				if (route) {
					try {
						await route.callback(req, res)
					} catch (e) {
						if (!this.errorHandler) res.send('Internal Server Error', 500)
						else this.errorHandler(e, req, res)

						if (this.log) console.log(`Router: Callback error: ${e}\nStack: ` + e.stack)
					}
					res.end()
					ended = true
				}
				else {
					// finding route
					for (let _route of this.staticRoutes) {
						if (req.url.startsWith(_route.path)) {
							if ((await lstat(__dirname + req.url)).isDirectory()) req.url += '/index.html'
							var staticRoute = _route
						}
					}
				}

				if (!ended && staticRoute) {
					// reading file
					try {
						let data = await readFile(__dirname + req.url, 'utf8')
						res.send(data)
					}
					catch (e) {
						// if not found
						if (e.code == 'ENOENT') {
							if (this.log) console.log('Not Found')
							if (!this.errorHandler) res.send('Not Found', 404)
							else this.errorHandler(Error('Not Found'), req, res)
						}
						// else 500
						else {
							if (this.log) console.log(e)
							if (!this.errorHandler) res.send('Internal Server Error', 500)
							else this.errorHandler(e, req, res)
						}
					}
					res.end()
					ended = true
				}
				else if (!ended) {
					if (this.log) console.log('Not Found')
					if (!this.errorHandler) res.send('Not Found', 404)
					else this.errorHandler(Error('Not Found'), req, res)
				}

				res.end()

				let end = Date.now()
				if (this.log) console.log(`Request time: ${end - start}ms`)
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
		let route = new Route(url, HttpMethods[method], callback);

		this.routes.push(route)
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

	// error handler
	setErrorHandler(handler: ErrorHandler) {
		if (typeof handler != 'function') {
			throw TypeError('handler must be a function');
		}
		this.errorHandler = handler
	}
}

export default tinyhttp

export {
	parser,
	tinyhttpParams,
	ExpressIncomingMessage,
	ExpressServerResponse,
	HttpMethods,
	MiddlewareCallback,
	ErrorHandler
}