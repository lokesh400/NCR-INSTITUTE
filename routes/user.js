const express = require("express");
const router = express.Router();
const passport = require("passport");
const nodemailer = require('nodemailer');
const passportLocalMongoose = require('passport-local-mongoose');

const User = require('../models/User');
const Modal = require('../models/Modal');
const Gallery = require('../models/Gallery');

const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { error } = require("console");

cloudinary.config({
    cloud_name:process.env.cloud_name, 
    api_key:process.env.api_key, 
    api_secret:process.env.api_secret
});

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files to 'uploads/' folder
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Use the original file name
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Initialize multer with diskStorage
const upload = multer({ storage: storage });

// Function to upload files to Cloudinary
const Upload = {
    uploadFile: async (filePath) => {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto", // Auto-detect file type (image, video, etc.)
            });
            return result;
        } catch (error) {
            throw new Error("Upload failed: " + error.message);
        }
    },
    deleteFile: async (publicId) => {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            throw new Error("Delete failed: " + error.message);
        }
    }
};

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

// Login route
router.get("/login", (req, res) => {
    if(req.user){
        res.redirect('/admin');
    } else {
        req.flash('error_msg', 'Welcome back');
        res.render("./users/login.ejs");
    }
});

router.post("/login", async (req, res, next) => {
   
    passport.authenticate("local", async (err, user, info) => {
        if (err) {
            console.error("Error during authentication:", err);
            req.flash('error_msg', 'Something went wrong. Please try again.');
            return res.redirect("/user/login"); // Redirect back to login if there was an error
        }
        if (!user) {
            req.flash('error_msg', info.message || 'Invalid credentials. Please check your username and password.');
            return res.redirect("/user/login"); // Invalid login credentials
        }
        // If login is successful, log in the user
        req.login(user, async (err) => {
            if (err) {
                console.error("Login failed:", err);
                req.flash('error_msg', 'Login failed. Please try again.');
                return res.redirect("/user/login");
            }
            // Flash a success message and redirect based on user role
            if (user.role === 'admin') {
                req.flash('success_msg', 'You have successfully logged in!');
                res.redirect("/admin"); // Redirect to admin dashboard
            } else {
                res.redirect("/student"); // Redirect to student page
            }
        });
    })(req, res, next);
});


// Logout route
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/"); // Redirect to homepage after logout
    });
});

router.get('/add/new/modal',ensureAuthenticated,isAdmin, (req,res)=>{
    res.render('admin/modalPhoto.ejs')
})

//update
router.get('/update/image',ensureAuthenticated,isAdmin, (req,res)=>{
    res.render('admin/updateModalPhoto.ejs')
})

router.post('/admin/update/modal',ensureAuthenticated,isAdmin, upload.single("file"), async (req, res) => {
    try {
        const existingModal = await Modal.findOne({})
        if (existingModal && existingModal.url) {
            const publicId = existingModal.url.split("/").pop().split(".")[0];
            await Upload.deleteFile(publicId);
        }
      const result = await Upload.uploadFile(req.file.path);  // Use the path for Cloudinary upload
      const imageUrl = result.secure_url;
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting local file:', err);
        } else {
          console.log('Local file deleted successfully');
        }
      });
      const updatedModal = await Modal.findOneAndUpdate(
        {}, // Find the first (or only) document
        { url:imageUrl }, // Update with new URL
        { new: true, upsert: true } // Return updated doc & create if not exists
    );
      req.flash('succes_msg',"New Car Added Successfully !");
      res.redirect('/admin')
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Upload failed: ' + error.message });
    }
  });

//add header image
router.post('/admin/add/new/modal',ensureAuthenticated,isAdmin, upload.single("file"), async (req, res) => {
    try {
      const result = await Upload.uploadFile(req.file.path);  // Use the path for Cloudinary upload
      const imageUrl = result.secure_url;
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting local file:', err);
        } else {
          console.log('Local file deleted successfully');
        }
      });
      const newCar = new Modal( {url:imageUrl });
      await newCar.save();
      req.flash('succes_msg',"New Car Added Successfully !");
      res.redirect('/admin')
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Upload failed: ' + error.message });
    }
  });

//add new gallery

router.get('/add/new/gallery/photo',ensureAuthenticated,isAdmin, (req,res)=>{
    res.render('admin/addGallery.ejs');
})

router.post('/admin/add/new/gallery',ensureAuthenticated,isAdmin, upload.single("file"), async (req, res) => {
    try {
      const result = await Upload.uploadFile(req.file.path);  // Use the path for Cloudinary upload
      const imageUrl = result.secure_url;
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting local file:', err);
        } else {
          console.log('Local file deleted successfully');
        }
      });
      const newCar = new Gallery( {url:imageUrl });
      await newCar.save();
      req.flash('succes_msg',"New Car Added Successfully !");
      res.redirect('/admin')
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Upload failed: ' + error.message });
    }
  });

router.delete('/images/delete/:id',ensureAuthenticated,isAdmin, upload.single("file"), async (req, res) => {
    try {
        const existingModal = await Gallery.findById(req.params.id);
        if (existingModal) {
            const publicId = existingModal.url.split("/").pop().split(".")[0];
            await Upload.deleteFile(publicId);
        }
    await Gallery.findByIdAndDelete(req.params.id);
    res.redirect('/gallery')
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Upload failed: ' + error.message });
    }
});

module.exports = router;



