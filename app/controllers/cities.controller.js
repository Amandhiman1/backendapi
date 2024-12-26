const db = require("../models");
const Cities = db.cities;
const itemsPerPage = 10;
const ObjectId = db.mongoose.Types.ObjectId;
// Create and Save a new Cities
exports.create = (req, res) => {
  // Validate request
  if (!req.body.english) {
    res.status(400).send({ message: "English param can not be empty!" });
    return;
  }
  // delete Object.assign(req.body, {['city_code']: req.body['code'] })['code'];

  // Create a Cities
  const cities = new Cities(req.body);
  cities.createdBy = req.user._id;
  // Save Cities in the database
  cities
    .save(cities)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Cities."
      });
    });
};

exports.createMultiple = (req, res) => {
  // Validate request
  if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
    res.status(400).send({ message: "Invalid or empty JSON array!" });
    return;
  }

  const insertPromises = req.body.map((item) => {
    // Validate each item in the array
    if (!item.english) {
      return Promise.reject({ message: "English param can not be empty!" });
    }

    // Create a Cities instance for each item in the array
    const cities = new Cities(item);
    cities.createdBy = req.user._id;
    // Save Cities in the database and return the promise
    return cities.save();
  });

  // Use Promise.all to wait for all insertions to complete
  Promise.all(insertPromises)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Cities."
      });
    });
};

// Retrieve all Citiess from the database.
exports.findAll = async (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  const { page } = req.query;
  if(page){
    
    const pageNumber = parseInt(page, 10) || 1;
    const totalCount = await Cities.find(condition).countDocuments();

    await Cities.find(condition).skip((pageNumber - 1) * itemsPerPage)
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
            err.message || "Some error occurred while retrieving citiess."
        });
      });

    }else{

      await Cities.find(condition)
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

// Find a single Cities with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  const alias = "code"; // The alias you want to use for the field
  const filter = { "_id":ObjectId(req.params.id)  };

  Cities.aggregate([
    {
      $match: filter // Apply the filter criteria
    },
    {
      $addFields: {
        ["id"]: "$_id", // Use alias for the field "originalFieldName"
        [alias]: "$city_code" // Use alias for the field "originalFieldName"
      }
    },
    {
      $limit: 1 // Fetch only one document
    }
  ]) //.findById(id)
    .then(data => {
      console.log(data)
      if (!data)
        res.status(404).send({ message: "Not found Cities with id " + id });
      else if(data.length>0) res.send(data[0]);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Cities with id=" + id });
    });
};

// Update a Cities by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  delete Object.assign(req.body, {['city_code']: req.body['code'] })['code'];
  req.body.updatedBy = req.user._id;
  Cities.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Cities with id=${id}. Maybe Cities was not found!`
        });
      } else res.send({ message: "Cities was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Cities with id=" + id
      });
    });
};

// Delete a Cities with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Cities.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Cities with id=${id}. Maybe Cities was not found!`
        });
      } else {
        res.send({
          message: "Cities was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Cities with id=" + id
      });
    });
};

// Delete all Citiess from the database.
exports.deleteAll = (req, res) => {
  Cities.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Citiess were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all citiess."
      });
    });
};

// Find all published Citiess
exports.findAllPublished = (req, res) => {
  Cities.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving citiess."
      });
    });
};
