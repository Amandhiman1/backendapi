const express = require("express");
const router = express.Router();
const jobApplicationController = require("../controllers/jobApplication.controller");
const multer = require("multer");
const path = require("path");
const { authenticateToken } = require("../middleware/auth.js");

// Set up multer storage for CV uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads_cv"); // Save CVs to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename for each uploaded CV
    },
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Apply to a job
router.post("/:jobId/apply", upload.single('cv'), jobApplicationController.applyJob);

// Fetch all applications for a specific job
router.get("/:jobId/applications", authenticateToken, jobApplicationController.getApplicationsByJobId);

module.exports = (app) => {
    app.use("/api/jobs", router);
};
