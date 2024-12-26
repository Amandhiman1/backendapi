
module.exports = app => {
    const newsletterSubscriber = require("../controllers/newsletterSubscriber.controller.js");
    const { authenticateToken } = require("../middleware/auth.js");

    var router = require("express").Router();

    router.post("/", newsletterSubscriber.create);
    router.get("/", authenticateToken, newsletterSubscriber.getAll);

    app.use("/api/newsletter-subscribe", router);
};