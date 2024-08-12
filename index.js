require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/persons')


const getEet = () => {
  const d = new Date()
  const localTime = d.getTime()
  const localOffset = d.getTimezoneOffset() * 60000
  const utc = localTime + localOffset
  const offset = 2
  const eet = utc + (3600000 * offset)
  const eetTimeNow = new Date(eet).toLocaleString()
  return eetTimeNow
}

app.use(express.json()) // parsing json objects
app.use(cors())
app.use(express.static('dist'))

morgan.token('showData', (req) => JSON.stringify(req.body)) // define token to show stringified object of data sent
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.showData (req, res), // use the token to configure custom logging function
  ].join(' ') //join every item in array with space
}))


app.get('/', (req, res) => {
  res.send('<h1>Welcome to the website<h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/info', (req, res) => {
  const eetTime = getEet()
  Person.find({}).then(returnedPersons => { // find all returns an array of objects (collection), length to calculate length.
    res.send(`<p>Phonebook has info for ${returnedPersons.length} people</p>
      <p>${eetTime} (EET)</p>`)
  })

})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => res.json(person))
    .catch(e => next(e))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(e => next(e))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(returnedPerson => res.json(returnedPerson))
    .catch(e => next(e))
})

app.post('/api/persons/', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save().then(savedPerson => res.json(savedPerson))
    .catch(e => next(e))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({
    error: 'unknown endpoint'
  })
}
app.use(unknownEndpoint)

const errorHandler = (e, req, res, next) => {
  if (e.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (e.name === 'ValidationError'){
    return res.status(400).send({ error: e.message })
  }
  next(e)
}
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`)
})