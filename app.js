const express = require("express");
require('dotenv').config();
const app = express();
const port = 666;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local")
const methodOverride = require("method-override");


const User = require('./models/User');
const Modal = require('./models/Modal');
const Gallery = require('./models/Gallery')


const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const { error } = require("console");

// Configure Cloudinary
cloudinary.config({
    cloud_name:process.env.cloud_name, 
    api_key:process.env.api_key, 
    api_secret:process.env.api_secret,
});

// Connect to MongoDB
try{
  mongoose.connect(process.env.mongo_url)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.log('Error connecting to MongoDB: ', err));;
  
} catch(error){
  console.log("error in connecting mongodb");
}
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(express.json());

const store = MongoStore.create({
  mongoUrl:process.env.mongo_url,
  crypto:{
    secret: process.env.secret,
  },
  touchAfter: 24*3600
})

store.on("error", ()=>{
  console.log("error in connecting mongo session store",error)
})

const sessionOptions = {
  store,
  secret: process.env.secret,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires: Date.now() + 3*24*60*60*1000,
    maxAge: 3*24*60*60*1000,
    httpOnly: true,
  }
}

const Upload = {
  uploadFile: async (filePath) => {
    try {
      const result = await cloudinary.uploader.upload(filePath);
      return result; // Return the upload result
    } catch (error) {
      throw new Error('Upload failed: ' + error.message);
    }
  },
};

app.use(methodOverride("_method"));
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.currUser = req.user;
    next();
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/user/login');
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.render("./error/accessdenied.ejs");
}

const userrouter = require("./routes/user.js");
const enquiryrouter = require("./routes/enquiry.js");
const jobRoutes = require('./routes/job');
const courseRoutes = require('./routes/course');

app.use("/user",userrouter);
app.use("/",enquiryrouter);
app.use('/', jobRoutes);
app.use('/', courseRoutes);

app.get("/", async (req,res)=>{
  const url = await Modal.findOne();
  res.render("./index.ejs",{url});
});

app.get("/admin",ensureAuthenticated,isAdmin, async (req,res)=>{
  const url = await Modal.findOne();
    res.render("admin/adminIndex.ejs",{url});
});

app.get("/facilities", async (req,res)=>{
    res.render("./facilities.ejs");
});

app.get("/gallery", async (req,res)=>{
  const images = await Gallery.find();
  res.render("gallery.ejs",{images});
});
  

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
