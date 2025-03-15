const express = require("express");
const router = express.Router();
const passport = require("passport");
const nodemailer = require("nodemailer");
const passportLocalMongoose = require("passport-local-mongoose");
require("dotenv").config();

const User = require("../models/User");
const Enquiry = require("../models/Enquiry");

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

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/user/login");
}

//get
// queries
router.get("/add/new/enquiry/batch", async (req, res) => {
  try {
    res.render("admin/addQuery.ejs");
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// queries
router.get("/enquiries",ensureAuthenticated,isAdmin, async (req, res) => {
  try {
    const enquiries = await Enquiry.find();
    res.render("admin/allQuery.ejs", { enquiries });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.post("/add/new/query", async (req, res) => {
  console.log("hello")
  const { name, mobile, message,email } = req.body;

  try {
      // Save the query in the database
      const newQuery = new Enquiry({ name, email, mobile, message });
      await newQuery.save();
      // Setup email transporter
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          secure: false,
          port: 587,
          auth: {
              user: "lokeshbadgujjar401@gmail.com",
              pass: process.env.mailpass // Ensure this is set correctly in environment variables
          }
      });
      // Define email options
      const mailOptions = {
          from: "lokeshbadgujjar401@gmail.com",
          to: "udaimgt@gmail.com",  // Replace with actual recipient email
          subject: 'New Query Recieved',
          html: `
              <h2>New Query Submitted</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Mobile:</strong> ${mobile}</p>
              <p><strong>Message:</strong> ${message}</p>
              <p>
                  <a href="tel:${mobile}" style="
                      display: inline-block;
                      background-color: #28a745;
                      color: white;
                      padding: 10px 20px;
                      text-decoration: none;
                      border-radius: 5px;
                      font-size: 16px;
                  ">📞 Call Now</a>
              </p>
          `
      };
      // Send email
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      req.flash('success_msg', "Query generated successfully");
      res.redirect('/');
  } catch (error) {
      console.error("Error:", error);
      req.flash('error_msg', "There was an error processing your query.");
      res.redirect('/');
  }
});

//delete enquiry
router.delete('/enquiry/delete/:id',ensureAuthenticated,isAdmin, async (req, res) => {
  try {
      await Enquiry.findByIdAndDelete(req.params.id);
      res.json({ message: 'Enquiry deleted successfully' });
  } catch (err) {
      res.status(500).send('Server Error');
  }
});

module.exports = router;
