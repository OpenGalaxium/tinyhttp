const tinyhttp = require('./index')

const app = new tinyhttp(1337, 'localhost')

app.get('/', (req, res) => {
	res.send('well cum to get')
})

app.route('/get', 'get', (req, res) => {
	res.send('well cum to route(get)')
})

app.static('/static')

app.run()
