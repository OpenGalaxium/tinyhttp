// import http
const http = require('http')

// routes
var routes = {}

// express like
var _res = http.ServerResponse.prototype
_res.send = function (a) {
	this.write(a)
}

const methods = Object.freeze({
	'get': 0,
	'head': 1,
	'post': 2,
	'put': 3,
	'delete': 4,
	'connect': 5,
	'options': 6,
	'trace': 7,
	'patch': 8,
	'all': 9
})

class tinyhttp {
	constructor(port, ip) {
		this.port = port
		this.ip = ip
		// create server
		this.server = http.createServer((req, res) => {
			var route = routes[req.url]
			if (route) {
				if (req.method == route.method || route.method == methods.all) {
					// if callback != function
					if (typeof route.callback !== 'function') {
						res.writeHead(500)
						throw new TypeError(`Router: Callback must be a function, recived '${typeof route.resp}'`)
					}
					else {
						try {
							route.callback(req, res)
						} catch (e) {
							res.writeHead(500)
							throw new Error(`Router: Callback error: ${e}\nStack: ` + e.stack)
						}
						res.writeHead(200)
					}
					res.end()
				}
			}
			return this
		})
	}
	// start server
	run() {
		this.server.listen(this.port, this.ip)
	}
	// add new route
	route(url, method, callback) {
		// check method valid
		if (!methods.hasOwnProperty(method.toLowerCase())) {
			throw new Error(`Router: Method '${method}' is not valid`)
		}
		else {
			routes[url] = {
				method: method.toUpperCase(),
				callback: callback
			}
		}
	}
	// some routes
	all(url, callback) { route(url, methods.all, callback) }
	get(url, callback) { route(url, methods.get, callback) }
	post(url, callback) { route(url, methods.post, callback) }
	head(url, callback) { route(url, methods.head, callback) }
}

// export class
module.exports = tinyhttp
