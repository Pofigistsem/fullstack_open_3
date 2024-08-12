const mongoose = require('mongoose')

if (process.argv.length < 3) { // if no password, exit
  console.log('give password to run mongo operation')
  process.exit(1)
}

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema ({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) { // if we have all data needed add a new person
  const person = new Person({ // a single instance of the person
    name: process.argv[3],
    number: process.argv[4],
  })

  person
    .save()
    .then(result => {
      console.log('Result: ',result)
      console.log(`added ${result.name} number ${result.number} to phonebook`)
      mongoose.connection.close()
    })
}

if (process.argv.length < 5) { // query if we are not provided with person parameter
  Person.find({}).then(persons => {
    persons.forEach(person => console.log(person))
    mongoose.connection.close()
  })
}

