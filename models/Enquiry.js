const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
    name:{
      type:String,
    },
    mobile:{
      type:String,
    },
    email:{
      type:String
    },
    message:{
      type:String,
    },
  });

const Enquiry = mongoose.model('Enquiry', EnquirySchema);
module.exports = Enquiry;