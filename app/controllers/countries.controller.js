const db = require("../models");
const Countries = db.countries;
const itemsPerPage = 10;
const ObjectId = db.mongoose.Types.ObjectId;

// Create and Save a new Countries
exports.create = (req, res) => {
  // Validate request
  if (!req.body.english) {
    res.status(400).send({ message: "english variable not found!" });
    return;
  }
  delete Object.assign(req.body, {['country_code']: req.body['country_code'] })['code'];

  // Create a Countries
  const countries = new Countries(req.body);
  countries.createdBy = req.user._id;
  // Save Countries in the database
  countries
    .save(countries)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Countries."
      });
    });
};

exports.createMultipleCountries = (req, res) => {
  // Validate request
  if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
    res.status(400).send({ message: "Invalid or empty JSON array!" });
    return;
  }

  const insertPromises = req.body.map((item) => {
    // Validate each item in the array
    if (!item.english) {
      return Promise.reject({ message: "English variable not found!" });
    }

    // Delete the 'country_code' key and create a Countries instance for each item in the array
    delete Object.assign(item, { ['country_code']: item['country_code'] })['code'];
    const country = new Countries(item);
    country.createdBy = req.user._id;
    // Save Countries in the database and return the promise
    return country.save();
  });

  // Use Promise.all to wait for all insertions to complete
  Promise.all(insertPromises)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Countries."
      });
    });
};

// Retrieve all Countriess from the database.
exports.findAll = async (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};


  const { page } = req.query;

  if(page){
    const pageNumber = parseInt(page, 10) || 1;
    const totalCount = await Countries.countDocuments();
  
    Countries.find(condition).skip((pageNumber - 1) * itemsPerPage)
    .limit(itemsPerPage)
      .then(data => {
        res.send({
          data:data,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / itemsPerPage)
        });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving countriess."
        });
      });
    }else{
      await Countries.find(condition)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving citiess."
        });
      });
    }
};

// Find a single Countries with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  const alias = "code"; // The alias you want to use for the field
  const filter = { "_id":ObjectId(req.params.id)  };

  Countries.aggregate([
    {
      $match: filter // Apply the filter criteria
    },
    {
      $addFields: {
        ["id"]: "$_id", // Use alias for the field "originalFieldName"
        [alias]: "$country_code" // Use alias for the field "originalFieldName"
      }
    },
    {
      $limit: 1 // Fetch only one document
    }
  ])
    .then(data => {
      if (!data)
      res.status(404).send({ message: "Not found Cities with id " + id });
      else if(data.length>0) res.send(data[0]);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Countries with id=" + id });
    });
};

// Update a Countries by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }
  delete Object.assign(req.body, {['country_code']: req.body['code'] })['code'];

  const id = req.params.id;
  req.body.updatedBy = req.user._id;
  Countries.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Countries with id=${id}. Maybe Countries was not found!`
        });
      } else res.send({ message: "Countries was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Countries with id=" + id
      });
    });
};

// Delete a Countries with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Countries.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Countries with id=${id}. Maybe Countries was not found!`
        });
      } else {
        res.send({
          message: "Countries was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Countries with id=" + id
      });
    });
};

// Delete all Countriess from the database.
exports.deleteAll = (req, res) => {
  Countries.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Countriess were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all countriess."
      });
    });
};

// Find all published Countriess
exports.findAllPublished = (req, res) => {
  Countries.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving countriess."
      });
    });
};
