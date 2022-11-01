const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer=require('nodemailer')

const config=require('../config/config')

const randomString=require('randomstring')


const sendResetPasswordMail=async(name,email,token)=>{
try{

  const transporter=nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLS:true,
    auth:{
      user:config.emailUser,
      pass:config.emailPassword
    }
  })
 const mailOptions={
  from:config.emailUser,
  to:email,
  subject:'for reset Password',
  html:'<p> Hii '+name+',please copy the link <a href="http://127.0.0.1:3000/reset-password?token='+token+'"> and reset password</a>'
 }
 transporter.sendMail(mailOptions,function(error,information){
  if(error){
    console.log(error)
  }else{
    console.log("Mail has been sent:-",information.response)
  }
 })


}catch(err){
  res.status(400).send({success:false,msg:err.message})

}
}





//check for the requestbody cannot be empty --
const isValidRequestBody = function (value) {
  return Object.keys(value).length > 0
}

//validaton check for the type of Value --
const isValid = (value) => {
  if (typeof value == 'undefined' || typeof value == null) return false;
  if (typeof value == 'string' && value.trim().length == 0) return false;
  if (typeof value != 'string') return false
  return true
}


//-------------------------------------------------API-1 [/register]--------------------------------------------------//

const createUser = async function (req, res) {
  try {
      let requestBody = req.body

      //validation for request body and its keys --
      if (!isValidRequestBody(requestBody)) {
          res.status(400).send({ status: false, message: "invalid request parameters.plzz provide user details" })
          return
      }

      //Validate attributes --
      let { name, email, password, phone } = requestBody

      

      if (!isValid(name)) {
          res.status(400).send({ status: false, message: "name is required" })
          return
      }

      //this will validate the type of name including alphabets and its property withe the help of regex.
      if (!/^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/.test(name)) {
          return res.status(400).send({ status: false, message: "Please enter valid user name." })
      }

      //Email Validation --
      if (!isValid(email)) {
          return res.status(400).send({ status: false, message: "plzz enter email" })
      }
      const emailPattern = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})/       //email regex validation for validate the type of email.

      if (!email.match(emailPattern)) {
          return res.status(400).send({ status: false, message: "This is not a valid email" })
      }

      email = email.toLowerCase().trim()
      const emailExt = await userModel.findOne({ email: email })
      if (emailExt) {
          return res.status(409).send({ status: false, message: "Email already exists" })
      }

      //Password Validations--
      if (!isValid(password)) {
          return res.status(400).send({ status: false, message: "plzz enter password" })
      }
      if (password.length < 8 || password.length > 15) {
          return res.status(400).send({ status: false, message: "plzz enter valid password" })
      }


      //Phone Validations--
      if (!isValid(phone)) {
          return res.status(400).send({ status: false, message: "plzz enter mobile" })
      }

      //this regex will to set the phone no. length to 10 numeric digits only.
      if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)) {
          return res.status(400).send({ status: false, message: "Please enter valid 10 digit mobile number." })
      }

      const phoneExt = await userModel.findOne({ phone: phone })
      if (phoneExt) {
          return res.status(409).send({ status: false, message: "phone number already exists" })
      }
      //Creation of data--
      let saveData = await userModel.create(requestBody)
      return res.status(201).send({ status: true, message: "success", data: saveData })
  }

  //catch errors will throw whenever you skip something into your piece of code 
  //or did'nt handle error properly for those key-vales who has been in required format.
  catch (err) {
      return res.status(500).send({ status: "error", message: err.message })
  }
}



//------------------------------------------------API-2 [/loginUser]-------------------------------------------------------//

const loginUser = async function (req, res) {
  try {
      const data = req.body;
      if (!isValidRequestBody(data)) return res.status(400).send({ status: false, message: "Please enter  mail and password" })

      const { email, password } = data

      //validation for login
      if (!isValid(email)) {
          return res.status(400).send({ status: false, message: "please enter email" })
      }

      //Email format Validation--
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.toLowerCase().trim())) {
          return res.status(400).send({ status: false, message: "please enter valid email address" })
      }
      //email = email.trim()

      if (!isValid(password)) {
          return res.status(400).send({ status: false, message: "please enter password" })
      }
      //pasword length should be min 8 and max 15 characters --
      if (password.length < 8 || password.length > 15) {
          return res.status(400).send({ status: false, message: "plzz enter valid password" })
      }

      //find data from userModel--
      let user = await userModel.findOne({ email, password });
      if (!user)
          return res.status(404).send({ status: false, message: "Please enter email address and password" });

      //token generation--
      let token = jwt.sign(
          {
              userId: user._id.toString(),
              //this is the payload data to jwt token it will validate the issue at and exp time with particular userId. 
          },config.secret_jwt,
         {expiresIn: "3600s"}
      );
      
      return res.status(200).send({ status: true, message: "token successfully Created", token: token });
  }
  catch (err) {
      console.log(err.message)
      return res.status(500).send({ status: "error", message: err.message })
  }
}


const forgetPassword=async function(req,res){
  try{
    const email=req.body.email
    checkUser=await userModel.findOne({email:email})

    if(checkUser){
    const randomStr=randomString.generate();
  const data= await userModel.updateOne({email:email},{$set:{token:randomStr}})
  sendResetPasswordMail(checkUser.name,checkUser.email,randomStr)
  res.status(200).send({success:true,msg:"plzz chk inbox of ur mail and reset password"})


    }
    else{
      res.status(200).send({success:true, msg:"this email does not exist"})
    
    }


  }
  catch(err){
    console.log(err.message)
    return res.status(500).send({ status: "error", message: err.message })

  }
}

const resetPassword=async(req,res)=>{
  try{

    const token=req.query.token
   const tokenData= await userModel.findOne({token:token})
   if(tokenData){
    const password=req.body.password
   const userData= await userModel.findByIdAndUpdate({_id:tokenData._id},{$set:{password:password,token:""}},{new:true})
   res.status(200).send({success:true,msg:"User passsword has been reset",data:userData})

   }
   else{
    res.status(200).send({success:true,msg:"this link is expired"})
   }

  }catch(err){
    console.log(err.message)
    return res.status(500).send({ status: "error", message: err.message })

  }

}

module.exports = { loginUser, createUser ,forgetPassword, resetPassword};