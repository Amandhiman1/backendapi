module.exports = app => {
    const cmsPages = require("../controllers/cmsPages.controller.js");
    const { authenticateToken } = require("../middleware/auth.js");

    var router = require("express").Router();

    router.post("/", authenticateToken, cmsPages.create);

    router.get("/:slug", cmsPages.findOne);

    app.use("/api/cms-page");
}