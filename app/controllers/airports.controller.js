const db = require("../models");
const Airports = db.airports;
const itemsPerPage = 10;

// Create and Save a new Airports
exports.create = (req, res) => {
  // Validate request
  console.log(req.body);
  if (!req.body.english) {
    res.status(400).send({ message: "english variable not found!" });
    return;
  }

  // Create a Airports
  const airports = new Airports(req.body);
  airports.createdBy = req.user._id;
  // Save Airports in the database
  airports
    .save(airports)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Airports.",
      });
    });
};

exports.createMultipleAirports = (req, res) => {
  // Validate request
  if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
    res.status(400).send({ message: "Invalid or empty JSON array!" });
    return;
  }

  const insertPromises = req.body.map((item) => {
    // Validate each item in the array
    // console.log('reached');
    // console.log(item.english);
    // if (!item.english) {
    //   return Promise.reject({ message: "English param can not be empty!" });
    // }

    // Create an Airports instance for each item in the array
    const airport = new Airports(item);
    airport.createdBy = req.user._id;

    // Save Airports in the database and return the promise
    return airport.save();
  });

  // Use Promise.all to wait for all insertions to complete
  Promise.all(insertPromises)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Airports.",
      });
    });
};

// Retrieve all Airportss from the database.
exports.findAll = async (req, res) => {
  const title = req.query.title;
  var condition = title
    ? { title: { $regex: new RegExp(title), $options: "i" } }
    : {};
  const { page } = req.query;
  if (page) {
    const pageNumber = parseInt(page, 10) || 1;

    const totalCount = await Airports.countDocuments();

    Airports.find(condition)
      .skip((pageNumber - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .then((data) => {
        res.send({
          data: data,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / itemsPerPage),
        });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving airportss.",
        });
      });
  } else {
    await Airports.find(condition)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving citiess.",
        });
      });
  }
};

// Find a single Airports with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Airports.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Airports with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Airports with id=" + id });
    });
};

// Update a Airports by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;
  req.body.updatedBy = req.user._id;
  Airports.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Airports with id=${id}. Maybe Airports was not found!`,
        });
      } else res.send({ message: "Airports was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Airports with id=" + id,
      });
    });
};

// Delete a Airports with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Airports.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Airports with id=${id}. Maybe Airports was not found!`,
        });
      } else {
        res.send({
          message: "Airports was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Airports with id=" + id,
      });
    });
};

// Delete all Airportss from the database.
exports.deleteAll = (req, res) => {
  Airports.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Airportss were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all airportss.",
      });
    });
};

// Find all published Airportss
exports.findAllPublished = (req, res) => {
  Airports.find({ published: true })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving airportss.",
      });
    });
};

exports.findByCode = (req, res) => {
  const code = req.params.code;
  Airports.find({ code: code })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving airportss.",
      });
    });
};

exports.findByCountry = (req, res) => {
  const code = req.params.code;
  Airports.find({ country_code: code })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving airports.",
      });
    });
};

exports.findByQuery = async (req, res) => {
  const query = req.query.query; // Assuming the query parameter is named 'query'
  const originCountry = req.query.origincountry;

  if (!query) {
      return res.status(400).send({
          message: "Query parameter is required for search.",
      });
  }

  // Use a case-insensitive regular expression for a flexible search
  const regexQuery = new RegExp(query, "i");

  const airportQuery = {
      $or: [
          { english: regexQuery },
          { airport_name: regexQuery },
          { code: regexQuery },
      ],
  };

  try {
      let data = await Airports.find(airportQuery).exec();

      // Sorting in memory
      data.sort((a, b) => {
          // Custom sorting logic here
          if (originCountry && a.country_code === originCountry && b.country_code !== originCountry) {
              return -1; // 'a' comes first if it matches origin country
          } else if (originCountry && b.country_code === originCountry && a.country_code !== originCountry) {
              return 1; // 'b' comes first if it matches origin country
          } else {
              // Default sorting based on airport name
              const indexA = a.english.toLowerCase().indexOf(query.toLowerCase());
              const indexB = b.english.toLowerCase().indexOf(query.toLowerCase());
              if (indexA === 0 && indexB !== 0) return -1;
              if (indexB === 0 && indexA !== 0) return 1;
              return 0;
          }
      });

      // Send sorted data as JSON response
      res.json(data);
  } catch (err) {
      res.status(500).send({
          message: err.message || "Some error occurred while retrieving airports.",
      });
  }
};

exports.getNearestAirport = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required." });
  }

  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);

  try {
    const airports = await Airports.find({
      latitude: { $exists: true },
      longitude: { $exists: true },
    });

    let nearestAirport = null;
    let minDistance = Infinity;

    airports.forEach((airport) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        airport.latitude,
        airport.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestAirport = airport;
      }
    });

    res.json(nearestAirport);
  } catch (error) {
    console.error("Error fetching airports:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Calculate distance between two points (in this case, airports)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180); // Convert degrees to radians
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}
