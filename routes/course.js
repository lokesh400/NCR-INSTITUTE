const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

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

// GET all courses (for display page)
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.render('admin/allCourses.ejs', { courses });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// GET Add Course Page
router.get('/add-course',ensureAuthenticated,isAdmin, (req, res) => {
    res.render('admin/addCourse.ejs');
});

// POST a new course
router.post('/courses',ensureAuthenticated,isAdmin, async (req, res) => {
    try {
        const { title, description, duration } = req.body;
        const newCourse = new Course({ title,description,duration });
        await newCourse.save();
        res.redirect('/courses'); // Redirect to courses page
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


router.delete('/courses/delete/:id',ensureAuthenticated,isAdmin, async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
