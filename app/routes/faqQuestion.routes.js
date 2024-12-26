module.exports = app => {
    const faqQuestion = require("../controllers/faqQuestion.controller.js");
    const { authenticateToken } = require("../middleware/auth.js");

    var router = require("express").Router();

    router.post("/", authenticateToken, faqQuestion.createQuestion);
    router.get("/", faqQuestion.getQuestions);
    router.get("/:slug", faqQuestion.getQuestionBySlug);
    router.delete("/:id", authenticateToken, faqQuestion.deleteQuestion);

    app.use("/api/faqQuestion", router);
};
