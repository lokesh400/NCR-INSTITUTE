const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    description:{
      type:String,
    },
    duration:{
      type:String
    }
  });

const Cousre = mongoose.model('Course', CourseSchema);
module.exports = Cousre;