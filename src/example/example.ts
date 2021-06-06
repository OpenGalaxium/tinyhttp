import tinyhttp from '../index'
import { parser } from '../index'

import routes from './routes';

const app = new tinyhttp()

app.use(parser.json)
app.use(parser.urlencoded)

routes(app) // using all routes from file

app.get('/', (req, res) => {
	res.send('working!')
})

app.run(80, 'localhost').then((port) => {
	console.log(`tinyhttp is running on port ${port}`)
})