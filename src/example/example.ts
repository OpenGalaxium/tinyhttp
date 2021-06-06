import tinyhttp from '../index'
import parser from '../parser'

import routes from './routes';

const app = new tinyhttp()

app.use(parser.json)
app.use(parser.urlencoded)

routes(app) // using all routes from file

app.run(8080, 'localhost').then((port) => {
	console.log(`tinyhttp is running on port ${port}`)
})