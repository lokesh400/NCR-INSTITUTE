const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name:{
      type:String,
    },
    photo:{
        type:String
    },
    title:{
        type:String,
    },
    startingDate:{
      type:String,
    },
    endingDate:{
      type:String
    },
    courseFee:{
        type:String
    },
  });

const Cousre = mongoose.model('Course', CourseSchema);
module.exports = Cousre;