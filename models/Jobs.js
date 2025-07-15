const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    name:{
      type:String,
    },
    mobile:{
      type:String,
    },
    email:{
      type:String
    },
    qualification:{
      type:String,
    },
  });

const JobSchema = new mongoose.Schema({
  title:{
    type:String,
  },
  description:{
    type:String,
  },
  role:{
    type:String
  },
  company:{
    type:String,
  },
  location:{
    type:String,
  },
  applications:[ApplicationSchema],
  isOpen:{
    type:String,
    default:"yes"
  },
});

const Job = mongoose.model('Job', JobSchema);
module.exports = Job;