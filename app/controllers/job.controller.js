const db = require("../models");
const Job = db.job;

// Function to generate slug from job title
const generateSlug = (title) => {
    return title
        .toLowerCase()                 // Convert to lowercase
        .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
        .trim()                        // Trim whitespace from both ends
        .replace(/\s+/g, '-');         // Replace spaces with hyphens
};

// Create a new job
exports.createJob = async (req, res) => {
    try {
        const { jobTitle, jobDesc, updatedBy, location, department } = req.body;
        console.log(req.body);
        const jobSlug = generateSlug(jobTitle.en);
        
        const newJob = new Job({
            jobTitle,
            jobSlug,
            jobDesc,
            location,
            department,
            createdBy: req.user.id,
            updatedBy
        });
        await newJob.save();
        res.status(201).json(newJob);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all jobs
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single job by slug
exports.getJobBySlug = async (req, res) => {
    try {
        const job = await Job.findOne({ jobSlug: req.params.slug });
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a job by slug
exports.updateJobBySlug = async (req, res) => {
    try {
        const { jobTitle, jobDesc, location, department } = req.body;

        // Generate a new slug based on the updated job title
        const newSlug = generateSlug(jobTitle.en);
        const updatedBy = req.user.id;

        // Build the update object
        const updateFields = { jobTitle, jobSlug: newSlug, jobDesc, updatedBy, location, department };

        // Find and update the job by the original slug
        const updatedJob = await Job.findOneAndUpdate(
            { jobSlug: req.params.slug },
            updateFields,
            { new: true }
        );

        // If no job is found, return a 404 status with an error message
        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Return the updated job in the response
        res.json(updatedJob);
    } catch (err) {
        // Return a 400 status with an error message in case of an error
        res.status(400).json({ message: err.message });
    }
};

// Delete a job by slug
exports.deleteJobBySlug = async (req, res) => {
    try {
        const deletedJob = await Job.findOneAndDelete({ jobSlug: req.params.slug });
        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
