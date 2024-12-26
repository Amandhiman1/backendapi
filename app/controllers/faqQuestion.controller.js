const mongoose = require("mongoose");
const db = require("../models");
const faqQuestion = db.faqQuestion;
const FAQCategory = db.FAQCategory;

exports.createQuestion = async (req, res) => {
  try {
    const { name, faqCategory } = req.body;
    const slug = name.en.name.toLowerCase().replace(/[^\w\s]/gi, '').split(' ').join('-') + '-' + Math.floor(Math.random() * 1000);
    const question = new faqQuestion({ name, slug, faqCategory });
    question.createdBy = req.user._id;
    await question.save();

    const faq_Category = await FAQCategory.findById(faqCategory);
    if (!faq_Category) {
      return res.status(404).json({ error: "FAQ category not found" });
    }

    faq_Category.questions.push({
      questionid: question._id,
      title: question.name,
      slug
    });
    faq_Category.createdBy = req.user._id;
    await faq_Category.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await faqQuestion.find({});
    if (!questions) {
      return res.status(404).json({ error: "Questions not found" });
    }
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestionBySlug = async (req, res) => {
  try {
    const {slug} = req.params;
    const questions = await faqQuestion.find({slug});
    if (!questions) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json(questions[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.updateQuestion = async (req, res) => {
  try {
    const { title, content, faqCategory, faqQuestion } = req.body;
    const question = await faqQuestion
      .findByIdAndUpdate(
        req.params.id,
        { title, content, faqCategory, faqQuestion },
        { new: true }
      )
      .populate("faqCategory")
      .populate("faqQuestion");
    if (!question) {
      return res.status(404).json({ error: "question not found" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;

    // Find and delete the question
    const question = await faqQuestion.findByIdAndDelete(questionId);
    if (!question) return res.status(404).send('Question not found');

    // Remove question from FAQCategory
    await FAQCategory.updateMany(
      { 'questions.questionid': questionId },
      { $pull: { questions: { questionid: questionId } } }
    );

    // Delete all articles associated with this question
    await FAQArticle.deleteMany({ faqQuestion: questionId });

    res.status(200).send('Question deleted successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}