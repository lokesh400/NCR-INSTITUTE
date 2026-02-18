const express = require("express");
require('dotenv').config();
const app = express();

// Validate required environment variables
const requiredEnvVars = ['mongo_url', 'secret', 'cloud_name', 'api_key', 'api_secret'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set these variables in your Render environment settings.');
  process.exit(1);
}
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

// Connect to MongoDB with better error handling
mongoose.connect(process.env.mongo_url, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log('MongoDB connected successfully!');
  console.log('Database:', process.env.mongo_url.split('/').pop().split('?')[0]);
})
.catch(err => {
  console.error('FATAL: MongoDB connection failed:', err.message);
  console.error('Cannot start server without database connection');
  process.exit(1);
});
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(express.json());

//const store = MongoStore.create({
 // mongoUrl:process.env.mongo_url,
 // crypto:{
//secret: process.env.secret,
//  },
//  touchAfter: 24*3600
//})

//store.on("error", (err)=>{
//  console.log("error in connecting mongo session store",err)
//})

//const sessionOptions = {
//  store,
//  secret: process.env.secret,
//  resave:false,
//  saveUninitialized:true,
//  cookie:{
//    expires: Date.now() + 3*24*60*60*1000,
//    maxAge: 3*24*60*60*1000,
//    httpOnly: true,
//  }
//}

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
//app.use(session(sessionOptions));
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

app.get("/test", (req, res) => {
  res.status(200).json({ status: "alive", time: Date.now() });
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

function startKeepAlive() {
  setInterval(async () => {
    try {
      const res = await fetch('https://ncr-institute.onrender.com/test');
      if (!res.ok) throw new Error("Ping failed");
      console.log("✅ Self ping successful");
    } catch (err) {
      console.error("❌ Self ping error:", err.message);
    }
  }, 2000); // 2 seconds
}

startKeepAlive();

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Page Not Found</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
      </style>
    </head>
    <body>
      <h1>404 - Page Not Found</h1>
      <p>The page <strong>${req.url}</strong> does not exist.</p>
      <a href="/">Go back to homepage</a>
    </body>
    </html>
  `);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>500 - Server Error</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #d9534f; }
      </style>
    </head>
    <body>
      <h1>500 - Internal Server Error</h1>
      <p>Something went wrong. Please try again later.</p>
      <a href="/">Go back to homepage</a>
    </body>
    </html>
  `);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
