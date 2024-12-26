const db = require('../models');
const FAQ = db.FAQ;

exports.create = async (req, res) => {
    try {
        const faq = new FAQ(req.body);
        faq.createdBy = req.user._id;
        const result = await faq.save();
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating FAQ:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getAll = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.status(200).json(faqs);
    } catch (err) {
        console.error("Error getting all FAQs:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
