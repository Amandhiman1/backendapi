const db = require("../models");
const Media = db.media;
const itemsPerPage = 10;

// Create and Save a new Media
exports.create = (req, res) => {
  // Validate request

  console.log(req.body)
  if (!req.body.category && !req.body.type && !req.body.subcategory) {
    res.status(400).send({ message: "Type and category,subcategory can not be empty!" });
    return;
  }

  // Create a Media
  const media = new Media({
    image: req.file.filename,
    category: req.body.category,
    subcategory: req.body.subcategory,
    type: req.body.type,
    alt: req.body.alt
  });

  // Save Media in the database
  media
    .save(media)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Media."
      });
    });
};

// Retrieve all Medias from the database.
exports.findAll = async (req, res) => {
  const name = req.query.name;
  var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};
  const { page } = req.query;

  if(page){
    const pageNumber = parseInt(page, 10) || 1;
    const totalCount = await Media.countDocuments();
  
    Media.find(condition).skip((pageNumber - 1) * itemsPerPage)
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
      await Media.find(condition)
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

// Find a single Media with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Media.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Media with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Media with id=" + id });
    });
};

// Update a Media by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Media.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Media with id=${id}. Maybe Media was not found!`
        });
      } else res.send({ message: "Media was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Media with id=" + id
      });
    });
};

// Delete a Media with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Media.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Media with id=${id}. Maybe Media was not found!`
        });
      } else {
        res.send({
          message: "Media was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Media with id=" + id
      });
    });
};

// Delete all Medias from the database.
exports.deleteAll = (req, res) => {
  Media.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Medias were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all medias."
      });
    });
};

// Find all published Medias
exports.findAllPublished = (req, res) => {
  Media.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving medias."
      });
    });
};

// Retrieve all Page_typess by filters from the database.
exports.filter = (req, res) => {
  //const category = req.body.category;
  var condition = {}
  if(req.body.categoryOrSub) condition['subcategory'] = req.body.categoryOrSub;
  if(req.body.type) condition['type'] = req.body.type;
  console.log(condition)
  if(Object.keys(condition).length>0){

    Media.find(condition)
    .then(data => {
      if(data.length>0)res.send(data[0]); else res.send([])
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Media."
      });
    });

  }else{
    res.send({'msg':'filter params empty','status':false});

  }
  
};
