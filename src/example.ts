import tinyhttp from './index'
import parser from './parser'

const app = new tinyhttp()

app.use(parser.json)
app.use(parser.urlencoded)

app.get('/', (req, res) => {
	res.send('working!')
})

app.get('/json', (req, res) => {
	res.json({ status: 'working' })
})

app.post('/post', (req, res) => {
	res.send(req.body)
})

app.get('/render', (req, res) => {
	res.render('index.html', { title: 'res.render example', msg: 'well cum to render' })
})

app.static('/www')

app.run(8080, 'localhost', (host, port) => {
	console.log('tinyhttp is running on http://' + host + ':' + port)
})