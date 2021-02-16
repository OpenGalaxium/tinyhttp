const tinyhttp = require('./index')

const app = new tinyhttp(1337, 'localhost')

app.get('/', (req, res) => {
  res.send('welcum')
})

app.run()
