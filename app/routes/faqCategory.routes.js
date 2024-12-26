module.exports = app => {
    const faqCategory = require("../controllers/faqCategory.controller.js");
    const { authenticateToken } = require("../middleware/auth.js");

    var router = require("express").Router();

    router.post("/", authenticateToken, faqCategory.createCategory);
    router.get("/", faqCategory.getCategory);
    router.delete("/:id", authenticateToken, faqCategory.deleteCategory);

    app.use("/api/faqCategory", router);
};
