import tinyhttp from '../index'

function routes(app: tinyhttp) {
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
        res.render('index.html', { title: 'res.render example', msg: 'render' })
    })

    app.static('/www')
}

export default routes;