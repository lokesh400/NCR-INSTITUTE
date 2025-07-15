const mongoose = require('mongoose');

const modalSchema = new mongoose.Schema({
    url:{
      type:String,
    }
  });
  
const Modal = mongoose.models.Modal || mongoose.model("Modal", modalSchema);
module.exports = Modal;