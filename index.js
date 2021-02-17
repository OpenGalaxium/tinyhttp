// import
const http = require('http')
const fs = require('fs')

// routes
var routes = {}
var staticRoutes = []

// express like
var _res = http.ServerResponse.prototype
_res.send = function(a) {
	this.write(a)
}

class tinyhttp {
	constructor(port, ip) {
		this.port = port
		this.ip = ip
		// create server
		this.server = http.createServer((req, res) => {
			res.writeHead(200)
			var route = routes[req.url]
			if (route) {
				if (req.method == route.method || route.method == 'ALL') {
					// if callback != function
					if (typeof route.callback !== 'function') console.log('router: callback is not a function (' + typeof route.resp + ')')
					else route.callback(req, res)
					res.end()
				}
			}
			else {
				staticRoutes.forEach(route => {
					if(req.url.startsWith(route.path)) {
						fs.readFile(__dirname + req.url, function(err, data) {
							if(!err) {
								res.writeHead(200)
								res.end(data)
							}
						})
					}
				})
			}
			return this
		})
	}
	// start server
	run() {
		this.server.listen(this.port, this.ip)
	}
	// add route
	route(url, method, callback) {
		routes[url] = {
			method: method.toString().toUpperCase(),
			callback: callback
		}
	}
	// some routes
	get(url, callback) {
		this.route(url, 'GET', callback)
	}
	post(url, callback) {
		this.route(url, 'POST', callback)
	}
	static(path) {
		staticRoutes.push({path: path})
	}
}

// export class
module.exports = tinyhttp