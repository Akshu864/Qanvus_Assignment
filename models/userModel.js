const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone:{
    type:String,
    required:true,
    unique:true,
    trim:true
  }
  ,token:{
    type:String,
    default:""
  }

 
},{timestamps:true});

module.exports = mongoose.model('User', userSchema);