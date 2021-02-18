import tinyhttp from './index'

const app = new tinyhttp()

app.get('/', (req, res) => {
	res.send('working!')
})

app.get('/json', (req, res) => {
	res.json({ status: 'working' })
})

app.get('/render', (req, res) => {
	res.render('index.html', { title: 'res.render example', msg: 'well cum to render' })
})

app.run(80, 'localhost', (host, port) => {
	console.log('tinyhttp is running on http://' + host + ':' + port)
})