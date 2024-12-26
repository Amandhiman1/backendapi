module.exports = app => {
    const inquiry = require("../controllers/inquiry.controller.js");
    const { authenticateToken } = require("../middleware/auth.js");

    var router = require("express").Router();

    // Create a new flight
    router.post("/", inquiry.create);
    router.get("/", authenticateToken, inquiry.getAllInquiries);
    router.get("/:type/:page", authenticateToken, inquiry.getTypeInquiries);
    router.post("/:inquiryId/status", authenticateToken, inquiry.updateStatus);
    router.delete("/delete", authenticateToken, inquiry.deleteAll);

    app.use("/api/inquiry", router);
};
