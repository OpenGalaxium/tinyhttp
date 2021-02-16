// import http
const http = require('http')

// routes
var routes = {}

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
				if (req.method == route.method) {
					// if callback != function
					if (typeof route.callback !== 'function') console.log('router: callback is not a function (' + typeof route.resp + ')')
					else route.callback(req, res)
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
	// add get route
	get(url, callback) {
		routes[url] = {
			method: 'GET',
			callback: callback
		}
	}
	// add post route
	post(url, callback) {
		routes[url] = {
			method: 'POST',
			callback: callback
		}
	}
}

// export class
module.exports = tinyhttp
