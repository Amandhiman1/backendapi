const db = require("../models");
const Languages = db.languages;

// Create and Save a new Languages
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name && !req.body.code) {
    res.status(400).send({ message: "Name and code can not be empty!" });
    return;
  }

  // Create a Languages
  const languages = new Languages({
    name: req.body.name,
    code: req.body.code
  });

  // Save Languages in the database
  languages.createdBy = req.user._id;
  languages
    .save(languages)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Languages."
      });
    });
};

// Retrieve all Languagess from the database.
exports.findAll = (req, res) => {
  const name = req.query.name;
  var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};

  Languages.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving languagess."
      });
    });
};

// Find a single Languages with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Languages.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Languages with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Languages with id=" + id });
    });
};

// Update a Languages by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;
  req.body.updatedBy = req.user._id;
  Languages.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Languages with id=${id}. Maybe Languages was not found!`
        });
      } else res.send({ message: "Languages was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Languages with id=" + id
      });
    });
};

// Delete a Languages with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Languages.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Languages with id=${id}. Maybe Languages was not found!`
        });
      } else {
        res.send({
          message: "Languages was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Languages with id=" + id
      });
    });
};

// Delete all Languagess from the database.
exports.deleteAll = (req, res) => {
  Languages.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Languagess were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all languagess."
      });
    });
};

// Find all published Languagess
exports.findAllPublished = (req, res) => {
  Languages.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving languagess."
      });
    });
};
