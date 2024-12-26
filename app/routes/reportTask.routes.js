module.exports = app => {
    const reportTaskController = require('../controllers/reportTask.controller');
    const { authenticateToken } = require("../middleware/auth");
  
    let router = require("express").Router();
  
    // Add a report
    router.post('/',  reportTaskController.addReport);
  
    // Get all reports by task ID
    router.get('/:task_id',  reportTaskController.getReportsByTaskId);
  
    app.use("/api/reports", router);
  };
  