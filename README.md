# tinyhttp
Light, fast, compact web framework

GitHub repo: https://github.com/OpenGalaxium/tinyhttp

npm package: https://www.npmjs.com/package/@opengalaxium/tinyhttp

# Installation
npm i @opengalaxium/tinyhttp

# Example usage
index.ts
```ts
import tinyhttp from 'tinyhttp'
import { parser } from 'tinyhttp'
import routes from './routes'

const app = new tinyhttp()

app.use(parser.json)
app.use(parser.urlencoded)

app.get('/', (req, res) => {
  res.send('working!')
})

routes(app)

app.run(80, 'localhost').then((port) => {
  console.log(`tinyhttp is running on port ${port}`)
})
```

routes.ts
```ts
import tinyhttp from 'tinyhttp'

function routes(app: tinyhttp) {
    app.get('/json', (req, res) => {
        res.json({ status: 'working' })
    })

    app.post('/post', (req, res) => {
        res.send(req.body)
    })

    app.get('/render', (req, res) => {
        res.render('index.html', { title: 'res.render example', msg: 'render' })
    })

    app.static('/www')
}

export default routes;
```