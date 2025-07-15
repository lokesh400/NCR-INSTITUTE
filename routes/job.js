const express = require('express');
const router = express.Router();
const Job = require('../models/Jobs');

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

// GET all jobs (for display page)
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await Job.find();
        res.render('admin/allJobs', { jobs });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// GET Add Job Page
router.get('/add-job',ensureAuthenticated,isAdmin, (req, res) => {
    res.render('admin/addJob');
});

// POST a new job
router.post('/jobs',ensureAuthenticated,isAdmin, async (req, res) => {
    try {
        const { title, description, role, company, location } = req.body;
        const newJob = new Job({ title, description, role, company, location });
        await newJob.save();
        res.redirect('/jobs'); // Redirect to jobs page
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// DELETE a job
router.delete('/jobs/:id',ensureAuthenticated,isAdmin, async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Route to apply for a job
router.get('/apply/:id', async (req, res) => {
    try {
       const {id} = req.params;
       res.render('admin/applyThisJob.ejs',{id})
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/:id/apply', async (req, res) => {
    try {
        const { name, mobile, email, qualification } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).send("Job not found");
        job.applications.push({ name, mobile, email, qualification });
        await job.save();
        res.redirect(`/`); // Redirect to the job details page
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

router.get('/jobs/:id/applications',ensureAuthenticated,isAdmin, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).send("Job not found");
        }
        res.render('admin/viewThisJob.ejs', { job });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/aboutus', async (req, res) => {
    try {
        res.render('aboutUs.ejs');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
