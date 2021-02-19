import { ServerResponse, IncomingMessage, Server, createServer } from 'http'
import { readFileSync, readFile, lstatSync } from 'fs'

// routes
var routes = {}
var staticRoutes = []

// express like
class ExpressServerResponse extends ServerResponse {
	send?(a, b?: number, c?: object) {
		let headers: any = { 'Content-Type': 'text/html' }
		if (c) headers = c

		let status = 200
		if (b) status = b

		this.writeHead(status, headers)
		this.write(a);
	}
	json?(a, b?) {
		this.send(JSON.stringify(a), b | 200, { 'Content-Type': 'application/json' })
	}
	render?(a, b) {
		let data = readFileSync(__dirname + '/views/' + a, 'utf8')

		for (var key in b) {
			var re = new RegExp(`{{${key}}}`, 'g')
			data = data.toString().replace(re, b[key])
			console.log(re.toString())
		}

		this.send(data)
	}
}

// all http methods
enum methods {
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

class tinyhttp {
	port: number
	host: string
	server: Server

	constructor() {
		// create server
		this.server = createServer((req, res: ExpressServerResponse) => {
			console.log(`${req.method} ${req.socket.remoteAddress} ${req.url}`)

			res.send = ExpressServerResponse.prototype.send
			res.json = ExpressServerResponse.prototype.json
			res.render = ExpressServerResponse.prototype.render

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
			return this
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
			callback(this.host, this.port);
		})

		this.server.listen(this.port, this.host)
	}
	// add new route
	route(url: string, method: methods, callback: Function = function (req: IncomingMessage, res: ExpressServerResponse) { }) {
		routes[url] = {
			method: methods[method],
			callback: callback
		}
	}
	// some routes
	all(url: string, callback: Function = function (req: IncomingMessage, res: ExpressServerResponse) { }) {
		this.route(url, methods.ALL, callback)
	}
	get(url: string, callback: Function = function (req: IncomingMessage, res: ExpressServerResponse) { }) {
		this.route(url, methods.GET, callback)
	}
	post(url: string, callback: Function = function (req: IncomingMessage, res: ExpressServerResponse) { }) {
		this.route(url, methods.POST, callback)
	}
	// static
	static(url: string) {
		staticRoutes.push({ path: url });
	}
}

export default tinyhttp