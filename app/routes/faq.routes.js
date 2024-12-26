module.exports = app => {
    const faq = require("../controllers/faq.controller.js");
    const { authenticateToken } = require("../middleware/auth.js");

    var router = require("express").Router();

    router.post("/", authenticateToken, faq.create);
    router.get("/", faq.getAll);

    app.use("/api/faq", router);
};
