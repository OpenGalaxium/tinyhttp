import tinyhttp from '../index'
import { parser } from '../index'

import routes from './routes';

const app = new tinyhttp()

app.use(parser.json)
app.use(parser.urlencoded)

app.use((req, res, next) => {
	console.log(`${req.method} ${req.socket.remoteAddress} ${req.url}`)
	next()
})

app.setErrorHandler((err, req, res) => {
	console.error('ERROR!')
	console.error(err)
	res.send(err)
})

routes(app) // using all routes from file

app.get('/', (req, res) => {
	res.send('working!')
})

app.run(80, 'localhost').then((port) => {
	console.log(`tinyhttp is running on port ${port}`)
})