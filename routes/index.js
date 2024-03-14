var express = require('express');
var router = express.Router();
var usermodel = require('./users')
var upload = require('./multer')
var QRCode = require('qrcode')
var transactionModel = require('./transaction')

router.use((req,res,next)=>{
  if (req.url=="/"){
  try { 
    if (req.session.authUser.auth==true){
      res.redirect('/profile')
      next()
    } else {
      next() 
  } }catch {
    next()
  }}else{
    next()
  }
})

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.seatCost = {silver:"120",gold : "399",diamond : "599"}
  const wrongData = req.flash("Error")
  wrongData==false?res.render('login',{showError:false}):res.render('login',{showError:true})
});


//GET PROFILE PAGE
router.get('/profile',async (req,res)=>{
  try{

    if (req.session.authUser.auth==true){
      const user = req.session.authUser
      const userID = user.authID
      //fetch data of user with id
      const userData = await usermodel.find({
        _id:userID
      })
      res.render('profile',{user:userData[0]})
    } else {
      res.redirect('/')
    }
  } catch{
    res.redirect('/')
  }
})

// GET PAYNOW
router.get('/paynow/:plan',async(req,res)=>{
  try {
    
    if(req.session.authUser.auth){
      const plan = req.params.plan
      let amount = '0'
      if (plan=='silver'){
        amount = req.session.seatCost.silver
      } else if (plan == 'gold'){
        amount = req.session.seatCost.gold
      } else if (plan == 'diamond'){
        amount = req.session.seatCost.diamond
      }
      const user = req.session.authUser
      const userID = user.authID
      //fetch data of user with id
      const userData = await usermodel.find({
        _id:userID
      })
      const d = new Date();
      let time = d.getTime();
      let hour = d.getHours();
      let minutes = d.getMinutes();
      let seconds = d.getSeconds();
      
      let actualTime = hour+':'+minutes+':'+seconds
      req.session.trId=time
      const transactionInfo = await transactionModel.create({
        trId:time,
        username:userData[0].username,
        email:userData[0].email,
        amount:amount,
        time:actualTime,
        plan:plan,
        userId:req.session.authUser.authID,
        status:'initiated'
      })
      const moneyApi = 'upi://pay?pa=jashg703gd-1@oksbi&pn=Jash%20Gro&am='+amount+'.00&cu=INR&aid=uGICAgMDQyfG_dA'
      QRCode.toDataURL(moneyApi, function (err, url) {
        const UserId = req.session.authUser.authID
        res.render('payment',{userID:UserId,QrCode:url,plan:plan,amount:amount,moneyUrl:moneyApi,trId:time})
      })
    } else {
      res.redirect('/error')
    }
  } catch (error) {
    res.redirect('/error')
  }
})


// POST REGISTER
router.post('/register', upload.single('image'),async(req,res)=>{
  const username = req.body.setUsername
  const email = req.body.setEmail
  const password = req.body.setPassword
  const checkEmail = await usermodel.find({email:email})
  if (checkEmail.length==0){
    const checkUsername = await usermodel.find({username:username})
    if (checkUsername.length==0){
      // create user
      const newUser = await usermodel.create({
        username:username,
        email:email,
        password:password,
        image:'/profileImages/'+req.body.setUsername+'.jpg'
      })
      req.session.authUser = {authID:newUser._id,auth:true} 
      res.redirect('/profile')
    } else{
      res.send("username already in use")
    }
  } else {
      res.send("Email already used !")
  }
})

// POST LOGIN
router.post('/login',async(req,res)=>{
  const username = req.body.username
  const password = req.body.password
  const User = await usermodel.find({
    username:username,
    password:password
  })
  if (User.length==0){
    req.flash("Error",true)
    res.redirect('/')
  } else {
    req.session.authUser = {authID:User[0]._id,auth:true} 
    res.redirect('/profile')
  }
})

// GET CANCELPAYMENT
router.get('/cancelPayment',async(req,res)=>{
  const trId=req.session.trId
  const filter = { trId: trId };
  const update = { status: 'failed' };

// `doc` is the document _before_ `update` was applied
  let failedTransaction = await transactionModel.findOneAndUpdate(filter, update);
  res.redirect('/')

})

// GET TRANSACTIONS
router.get('/transactions',async(req,res)=>{
  try {
    const authID = req.session.authUser.authID
    const transactions = await transactionModel.find({userId:authID})
    res.render('mytransaction',{transactions:transactions})
  } catch (error) {
    res.redirect('/error')
  }
})

// GET LOGOUT
router.get("/logout",(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
