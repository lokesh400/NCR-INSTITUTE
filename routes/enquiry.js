const express = require("express");
const router = express.Router();
const passport = require("passport");
const nodemailer = require('nodemailer');
const passportLocalMongoose = require('passport-local-mongoose');

const User = require('../models/User');
const Enquiry = require('../models/Enquiry')


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/user/login');
  }



router.post("/add/new/query", async (req, res) => {
    const {name,email,mobile,message} = req.body
    const newQuery = new Enquiry({
        name,
        email,
        message,
        mobile
    })
    await newQuery.save();
    req.flash("success_msg",'New Query Posted Successfully');
    res.redirect('/');
});

// queries
router.get('/enquiries', async (req, res) => {
    try {
        const enquiries = await Enquiry.find();
        res.render('admin/allQuery.ejs', { enquiries });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});



module.exports = router;



