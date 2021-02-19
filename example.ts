import tinyhttp from './index'
import { IncomingMessage } from 'http'

const app = new tinyhttp()

// app.use((req: IncomingMessage, res) => { // logger
// 	console.log(`${req.method} ${req.url} ${req.socket.remoteAddress}\nBody: `, req)
// })

app.get('/', (req, res) => {
	res.send('working!')
})

app.get('/json', (req, res) => {
	res.json({ status: 'working' })
})

app.get('/render', (req, res) => {
	res.render('index.html', { title: 'res.render example', msg: 'well cum to render' })
})

app.static('/www')

app.run(8080, 'localhost', (host, port) => {
	console.log('tinyhttp is running on http://' + host + ':' + port)
})