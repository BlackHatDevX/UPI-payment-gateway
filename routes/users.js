const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://jashgro:703grover@cluster0.fcsmqyc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
// mongoose.connect('mongodb://127.0.0.1:27017/evilMongo')

const userSchema = mongoose.Schema({
  username:String,
  email:String,
  password:String,
  image:String
})

module.exports = mongoose.model('user',userSchema)