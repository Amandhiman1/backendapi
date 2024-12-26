const db = require("../models");
const Subscriber = db.newsletterSubscriber;

exports.create = (req, res) => {
  const newSubscriber = new Subscriber({ email: req.body.email });
  newSubscriber.save((err) => {
    if (err) {
      return res.status(400).send("Error subscribing");
    }
    res.status(200).send("Subscribed successfully");
  });
};

exports.getAll = (req, res) => {
  Subscriber.find({}, (err, subscribers) => {
    if (err) {
      return res.status(400).send("Error fetching subscribers");
    }
    res.status(200).json(subscribers);
  });
};
