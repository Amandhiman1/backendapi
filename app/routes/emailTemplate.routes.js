module.exports = app => {
    const emailTemplate = require("../controllers/emailTemplate.controller.js");
    const { authenticateToken } = require("../middleware/auth.js");

    var router = require("express").Router();

    router.post("/", authenticateToken, emailTemplate.create);
    router.get("/", emailTemplate.getAll);
    router.post('/send-email', emailTemplate.sendEmail);
    router.delete('/:id', authenticateToken, emailTemplate.delete);

    app.use("/api/emailTemplate", router);
};
