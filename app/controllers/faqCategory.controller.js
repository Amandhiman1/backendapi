const mongoose = require("mongoose");
const db = require("../models");
const FAQCategory = db.FAQCategory;
const FAQQuestion = db.faqQuestion;
const FAQArticle = db.faqArticle;

exports.createCategory = async (req, res) => {
  try {
    const { title } = req.body;
    // Generate slug from name
    const slug = title.en.name.toLowerCase().replace(/[^\w\s]/gi, '').split(' ').join('-') + '-' + Math.floor(Math.random() * 1000);

    const category = new FAQCategory({ title, slug });
    category.createdBy = req.user._id;
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await FAQCategory.find({});
    if (!category) {
      return res.status(404).json({ error: "category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find and delete the category
    const category = await FAQCategory.findByIdAndDelete(categoryId);
    if (!category) return res.status(404).send('Category not found');

    // Delete all questions associated with this category
    const questions = category.questions.map(q => q.questionid);
    await FAQQuestion.deleteMany({ _id: { $in: questions } });

    // Delete all articles associated with these questions
    await FAQArticle.deleteMany({ faqQuestion: { $in: questions } });

    res.status(200).send('Category deleted successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};