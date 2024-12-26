
// routes/user.routes.js

module.exports = app => {
    const tasks = require("../controllers/tasks.controller");
    const { authenticateToken, authorizePermissions } = require("../middleware/auth");
    const { upload } = require("../middleware/upload_file");

    let router = require("express").Router();

    const tasksController = require('../controllers/tasks.controller');

    // Create a task
    router.post('/', authenticateToken, authorizePermissions(['Admin', 'Manager', 'TeamLead', 'Executive']), tasksController.createTask);

    // Assign a task
    router.post('/assign', authenticateToken, authorizePermissions(['Manager', 'TeamLead']), tasksController.assignTask);

    // Change task status
    router.put('/:taskId/status', authenticateToken, authorizePermissions(['Manager', 'TeamLead', 'Executive']), tasksController.changeTaskStatus);

    // Request task approval
    router.post('/request-approval', authenticateToken, authorizePermissions(['TeamLead', 'Executive']), tasksController.requestTaskApproval);

    // Approve or reject task
    router.post('/:taskId/approve', authenticateToken, authorizePermissions(['Manager', 'TeamLead']), tasksController.approveTask);
    router.post('/:taskId/reject', authenticateToken, authorizePermissions(['Manager', 'TeamLead']), tasksController.rejectTask);
    router.get('/', authenticateToken,  tasksController.getTasks);
    router.get('/:taskId', authenticateToken, authorizePermissions(['Admin', 'Manager', 'TeamLead', 'Executive']), tasksController.getTaskById);
    router.put('/:taskId', authenticateToken, authorizePermissions(['Admin', 'Manager', 'TeamLead','Executive']), tasksController.updateTask);
    router.delete('/:taskId', authenticateToken, authorizePermissions(['Admin', 'Manager']), tasksController.deleteTask);


    app.use("/api/tasks", router);
};
