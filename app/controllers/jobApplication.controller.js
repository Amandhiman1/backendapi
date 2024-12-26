const db = require("../models");
const { sendEmail } = require("../utils/email");
const JobApplication = db.jobApplication;

// Apply to a job
exports.applyJob = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const jobId = req.params.jobId;

        // Validate if a CV file is uploaded
        if (!req.file || req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ message: 'CV must be a PDF file.' });
        }

        // Check if an application with the same email or phone number already exists for this job
        const existingApplication = await JobApplication.findOne({
            jobId,
            $or: [{ email }, { phone }]
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'An application with this email or phone number already exists for this job.' });
        }

        // Create a new job application
        const newApplication = new JobApplication({
            name,
            email,
            phone,
            cvFile: req.file.filename, // Save the filename of the uploaded CV
            jobId
        });

        // Send confirmation email to the applicant
        await sendEmail(email, 'Job Application Received', 'Your job application has been received. We will get back to you soon.');

        // Save the new application to the database
        await newApplication.save();
        
        // Return the newly created application
        res.status(201).json(newApplication);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Fetch all applications for a specific job
exports.getApplicationsByJobId = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const applications = await JobApplication.find({ jobId });
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
