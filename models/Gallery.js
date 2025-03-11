const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    url:{
      type:String,
    }
  });
  
const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);
module.exports = Gallery;