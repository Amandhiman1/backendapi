
// routes/user.routes.js

module.exports = app => {
    const users = require("../controllers/user.controller");
    const { authenticateToken, authorizePermissions } = require("../middleware/auth");
    const { upload } = require("../middleware/upload_file");

    let router = require("express").Router();

    // Update user profile
    router.put("/profile", authenticateToken, upload.single('file'),  users.updateProfile);
    router.post('/', authenticateToken, authorizePermissions(['Admin', 'Manager', 'TeamLead']), users.createUser);
    router.get('/list', authenticateToken, users.getUserList);
    router.get('/:id', authenticateToken, users.getUserById);
    
    router.get('/report/:userid', authenticateToken, users.getUserByIds); // by prince

    app.use("/api/users", router);
};
