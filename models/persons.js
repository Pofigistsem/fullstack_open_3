const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to: ', url)

mongoose.connect(url)
  .then(() => console.log('connected successfully'))
  .catch(e => console.log('connection failed, due to error: ', e.message))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    mingLength: 8,
    required: true,
    validate: {
      validator: (v) => {
        return /\d{2,3}-\d{7,8}/.test(v) // hard limit to format
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)