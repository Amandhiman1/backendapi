const db = require("../models");
const EmailTemplate = db.emailTemplate;
const Subscriber = db.newsletterSubscriber;
const {sendEmail} = require('../utils/email');

exports.create = async (req, res) => {
  const newTemplate = new EmailTemplate({
    language: req.body.language,
    subject: req.body.subject,
    body: req.body.body,
    createdBy: req.user._id,
  });
  newTemplate.save((err) => {
    if (err) {
      return res.status(400).send("Error saving template");
    }
    res.status(200).send("Template saved successfully");
  });
};

exports.getAll = async (req, res) => {
  try {
    const templates = await EmailTemplate.find();
    res.status(200).json(templates);
  } catch (err) {
    console.error("Error getting all Templates:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.sendEmail = async (req, res) => {
  const { templateId } = req.body;

  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).send('Template not found');
    }

    const subscribers = await Subscriber.find({});
    const emailPromises = subscribers.map(subscriber =>
      sendEmail(subscriber.email, template.subject, template.body)
    );

    await Promise.all(emailPromises);

    template.status = 'Sent';
    await template.save();

    res.status(200).send('Emails sent successfully');
  } catch (err) {
    res.status(500).send('Error sending emails');
  }
};

exports.delete = async (req, res) => {
  const templateId = req.params.id;

  EmailTemplate.findByIdAndDelete(templateId, (err, deletedTemplate) => {
    if (err) {
      return res.status(400).send("Error deleting template");
    }
    if (!deletedTemplate) {
      return res.status(404).send("Template not found");
    }
    res.status(200).send("Template deleted successfully");
  });
};
