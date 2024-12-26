module.exports = (app) => {
  var router = require("express").Router();
  const job = require("../controllers/job.controller");
  const { authenticateToken } = require("../middleware/auth");

  // Create a new job
  router.post("/", authenticateToken, job.createJob);

  // Get all jobs
  router.get("/", job.getAllJobs);

  // Get a single job by id
  router.get("/:slug", job.getJobBySlug);

  // Update an offer by id
  router.put("/:slug", authenticateToken, job.updateJobBySlug);

  // Delete an offer by id
  router.delete("/:slug", authenticateToken, job.deleteJobBySlug);

  app.use("/api/job", router);
};
