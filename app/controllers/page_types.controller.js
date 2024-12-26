const db = require("../models");
const Page_types = db.page_types;
const Webpages = db.webpages;
const Cities = db.cities;
const Countries = db.countries;
const Airlines = db.airlines;
const Airports = db.airports;

// Find all published Page_typess
exports.allcount = async (req, res) => {
  let objVar = {}
  //page types count
  var city_paget_count = await Page_types.countDocuments({ 'category': 'cities' })
  var country_paget_count = await Page_types.countDocuments({ 'category': 'countries' })
  var airline_paget_count = await Page_types.countDocuments({ 'category': 'airlines' })
  var airport_paget_count = await Page_types.countDocuments({ 'category': 'airports' })

  // pages count
  var city_page_count = await Webpages.countDocuments({ 'category': 'cities' })
  var country_page_count = await Webpages.countDocuments({ 'category': 'countries' })
  var airline_page_count = await Webpages.countDocuments({ 'category': 'airlines' })
  var airport_page_count = await Webpages.countDocuments({ 'category': 'airports' })

  // count for category
  var city_count = await Cities.countDocuments()
  var country_count = await Countries.countDocuments()
  var airline_count = await Airlines.countDocuments()
  var airport_count = await Airports.countDocuments()

  objVar['cities'] = city_count
  objVar['countries'] = country_count
  objVar['airlines'] = airline_count
  objVar['airports'] = airport_count
  objVar['city_page_count'] = city_page_count
  objVar['country_page_count'] = country_page_count
  objVar['airline_page_count'] = airline_page_count
  objVar['airport_page_count'] = airport_page_count
  objVar['city_paget_count'] = city_paget_count
  objVar['country_paget_count'] = country_paget_count
  objVar['airline_paget_count'] = airline_paget_count
  objVar['airport_paget_count'] = airport_paget_count

  res.status(200).json({ 'success': '200', 'data': objVar });


}

// Create and Save a new Page_types
exports.create = (req, res) => {
  // Validate request
  console.log(req.body);
  if (!req.body.title || !req.body.category) {
    res.status(400).send({ message: "title and category can not be empty!" });
    return;
  }

  // Create a Page_types
  const page_type = new Page_types({
    title: req.body.title,
    languages: req.body.languages,
    category: req.body.category,
    createdBy: req.user._id
  });

  // Save Page_types in the database
  page_type
    .save(page_type)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Page_types."
      });
    });
};

exports.addData = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  try {
    // Find the Page_types document by ID
    const pageType = await Page_types.findById(id);

    // Check if the Page_types document exists
    if (!pageType) {
      return res.status(404).json({ message: 'PageType not found.' });
    }

    // Update the data field
    pageType.data = data;
    pageType.updatedBy = req.user._id;
    // Save the updated document
    const updatedPageType = await pageType.save();

    res.json(updatedPageType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating PageType data.' });
  }
}

// Retrieve all Page_typess from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  Page_types.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving page_typess."
      });
    });
};

// Retrieve all Page_typess by filters from the database.
exports.filter = (req, res) => {
  //const category = req.body.category;
  var condition = {}
  if (req.body.category) condition['category'] = req.body.category;
  if (req.body.page_type) condition['page_type'] = req.body.page_type;

  if (Object.keys(condition).length > 0) {
    Page_types.find(condition)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving page_typess."
        });
      });
  } else {
    res.send({ 'msg': 'filter params empty', 'status': false });
  }
};

// Find a single Page_types with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Page_types.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Page_types with id " + id });
      else res.send({ data });
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Page_types with id=" + id });
    });
};

// Update a Page_types by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;
  req.body.updatedBy = req.user._id;
  Page_types.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Page_types with id=${id}. Maybe Page_types was not found!`
        });
      } else res.send({ message: "Page_types was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Page_types with id=" + id
      });
    });
};

// Delete a Page_types with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  console.log(id);
  // Delete webpages first
  Webpages.deleteMany({ page_type: id })
    .then(() => {
      // Now, delete the Page_types
      Page_types.findByIdAndRemove(id, { useFindAndModify: false })
        .then(data => {
          if (!data) {
            res.status(404).send({
              message: `Cannot delete Page_types with id=${id}. Maybe Page_types was not found!`
            });
          } else {
            res.send({
              message: "Page_types and associated webpages were deleted successfully!"
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Could not delete Page_types with id=" + id
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete webpages associated with Page_types id=" + id
      });
    });
};


// Delete all Page_typess from the database.
exports.deleteAll = (req, res) => {
  Page_types.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Page_typess were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all page_typess."
      });
    });
};

// Find all published Page_typess
exports.findAllPublished = (req, res) => {
  Page_types.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving page_typess."
      });
    });
};
