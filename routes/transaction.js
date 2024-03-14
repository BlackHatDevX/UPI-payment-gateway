const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://jashgro:703grover@cluster0.fcsmqyc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
// mongoose.connect('mongodb://127.0.0.1:27017/evilMongo')

const transactionSchema = mongoose.Schema({
  trId:Number,
  email:String,
  amount:String,
  plan:String,
  time:String,
  username:String,
  userId:String,
  status:String
})

module.exports = mongoose.model('transaction',transactionSchema)