module.exports = app => {
    const faqArticle = require("../controllers/faqArticle.controller.js");
    const { authenticateToken } = require("../middleware/auth.js");

    var router = require("express").Router();

    router.post("/", authenticateToken, faqArticle.createArticle);
    router.get("/", faqArticle.getArticles);
    router.get("/:slug", faqArticle.getArticleBySlug);
    router.delete("/:id", authenticateToken, faqArticle.deleteArticle);

    app.use("/api/faqArticle", router);
};
