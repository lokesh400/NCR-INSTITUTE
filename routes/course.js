const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// GET all courses (for display page)
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.render('admin/allCourses', { courses });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// GET Add Course Page
router.get('/add-course', (req, res) => {
    res.render('admin/addCourse.ejs');
});

// POST a new course
router.post('/courses', async (req, res) => {
    try {
        const { name, photo, title, startingDate, endingDate, courseFee } = req.body;
        const newCourse = new Course({ name, photo, title, startingDate, endingDate, courseFee });
        await newCourse.save();
        res.redirect('/courses'); // Redirect to courses page
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// DELETE a course
router.delete('/courses/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
