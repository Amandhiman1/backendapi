const db = require("../models");
var Excel = require('exceljs');
var path = require('path');
const ObjectId = db.mongoose.Types.ObjectId;

const Airline = db.airlines;
const Countries = db.countries;
const Cities = db.cities;
const itemsPerPage = 10;
const Airports = db.airports;

// Create and Save a new Airline
exports.create = (req, res) => {
  // Validate request
  // if (!req.body.english) {
  //   res.status(400).send({ message: "english variable not found!" });
  //   return;
  // }

  delete Object.assign(req.body, {['airline_name']: req.body['airline_name'] })['english'];
  delete Object.assign(req.body, {['airline_code']: req.body['airline_code'] })['code'];

  // Create a Airline
  const airline = new Airline(req.body);
  airline.createdBy= req.user._id,
  // Save Airline in the database
  airline
    .save(airline)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Airline."
      });
    });
};

// Retrieve all airlines from the database.
exports.findAll = async (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  const { page } = req.query;
  if(page){
    const pageNumber = parseInt(page, 10) || 1;

    const totalCount = await Airline.countDocuments();


    Airline.find(condition).skip((pageNumber - 1) * itemsPerPage)
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
            err.message || "Some error occurred while retrieving airlines."
        });
      });
  } else {
    await Airline.find(condition)
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

// Find a single Airline with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  const alias = "code"; // The alias you want to use for the field
  const filter = { "_id":ObjectId(req.params.id)  };

  Airline.aggregate([
    {
      $match: filter // Apply the filter criteria
    },
    {
      $addFields: {
        ["id"]: "$_id", // Use alias for the field "originalFieldName"
        ["english"]: "$airline_name", // Use alias for the field "originalFieldName"
        [alias]: "$airline_code" // Use alias for the field "originalFieldName"
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
        .send({ message: "Error retrieving Airline with id=" + id });
    });
};

// Update a Airline by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;
  delete Object.assign(req.body, {['airline_name']: req.body['english'] })['english'];
  delete Object.assign(req.body, {['airline_code']: req.body['code'] })['code'];

  req.body.updatedBy = req.user._id;
  Airline.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Airline with id=${id}. Maybe Airline was not found!`
        });
      } else res.send({ message: "Airline was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Airline with id=" + id
      });
    });
};

// Delete a Airline with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Airline.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Airline with id=${id}. Maybe Airline was not found!`
        });
      } else {
        res.send({
          message: "Airline was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Airline with id=" + id
      });
    });
};

// Delete all airlines from the database.
exports.deleteAll = (req, res) => {
  Airline.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} airlines were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all airlines."
      });
    });
};

// Find all published airlines
exports.findAllPublished = (req, res) => {
  Airline.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving airlines."
      });
    });
};


// Find all published airlines
exports.importData = (req, res) => {
    var wb = new Excel.Workbook();
    var filePath = path.resolve(__dirname,'sample.xlsx');

    console.log(filePath)

    wb.xlsx.readFile(filePath).then(() => {
    
      const sh = wb.getWorksheet('Sheet4');
      var arrayToInsert = [];
      //console.log(ws)
      //const c1 = ws.getColumn(1);
      // c1.eachCell(c => {
  
      //     console.log(c.value);
      // });
  
      // const c2 = ws.getColumn(2);
      
      // c2.eachCell(c => {
  
      //     console.log(c.value);
      // });

      for (i = 1; i <= sh.rowCount; i++) {
        console.log(sh.getRow(i).getCell(1).value);
        console.log(sh.getRow(i).getCell(2).value);

        var singleRow = {
                      airport_id: sh.getRow(i).getCell(1).value,
                      airport_type: sh.getRow(i).getCell(2).value,
                      city_code: sh.getRow(i).getCell(3).value,
                      country_code: sh.getRow(i).getCell(5).value,
                      code: sh.getRow(i).getCell(6).value,
                      english: sh.getRow(i).getCell(7).value,
                      spanish: sh.getRow(i).getCell(8).value,
                  };
        arrayToInsert.push(singleRow);
      }


    /* Airports.insertMany(arrayToInsert)  
    .then((result) => {
            console.log("result ", result);
            res.status(200).json({'success': 'new documents added!', 'data': result});
    })
    .catch(err => {
            console.error("error ", err);
            res.status(400).json({err});
    }); */

      res.send(arrayToInsert);

        // sh.getRow(1).getCell(2).value = 32;
        // wb.xlsx.writeFile("sample2.xlsx");
        // console.log("Row-3 | Cell-2 - "+sh.getRow(3).getCell(2).value);

      
    });
    
  };
