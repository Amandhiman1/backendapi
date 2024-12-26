const db = require("../models");
const Task = require("../models/tasks.model");
const Inquiry = db.inquiry;
const Airports = db.airports; // Import the Airports model

exports.create = async (req, res) => {
  try {
    const { formData } = req.body;
    let originCity, originCountry, destinationCity, destinationCountry;
    let originCode, destinationCode;

    // Check if the formData contains Segments with Origin and Destination
    if (formData && formData.Segments && formData.Segments.length > 0) {
      originCode = formData.Segments[0].Origin;
      destinationCode = formData.Segments[0].Destination;

      // Find the Origin airport details
      const originAirport = await Airports.findOne({ code: originCode });
      if (originAirport) {
        originCity = originAirport.city_code;
        originCountry = originAirport.country_code;
      }

      // Find the Destination airport details
      const destinationAirport = await Airports.findOne({ code: destinationCode });
      if (destinationAirport) {
        destinationCity = destinationAirport.city_code;
        destinationCountry = destinationAirport.country_code;
      }
    }

    // Create the inquiry data with the found values
    const inquiryData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      formData: req.body.formData,
      status: "Pending",
      originCity: originCity,
      originCountry: originCountry,
      destinationCity: destinationCity,
      destinationCountry: destinationCountry,
      originCode: originCode,          
      destinationCode: destinationCode, 
      airlines: req.body.airlines, 

    };

    // Determine the type of inquiry based on the offerId
    if (req.body.offerId) {
      inquiryData.offerId = req.body.offerId;
      inquiryData.type = "OFF-line";
    } else {
      inquiryData.type = "On-line";
    }

    // Create a new Inquiry object and save it to the database
    const inquiry = new Inquiry(inquiryData);

    inquiry
      .save()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Inquiry.",
        });
      });
  } catch (error) {
    console.error("Error calling API:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// old code here

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find();
    res.send(inquiries);
  } catch (error) {
    console.error("Error calling API:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTypeInquiries = async (req, res) => {
  const type = req.params.type;
  const page = parseInt(req.params.page) || 1; // Default to page 1 if page parameter is not provided
  const limit = 10; // Number of inquiries per page

  try {    
    const assignedTask = await Task.find({ assignedTo: req.user.id, taskType: 'Inquiry' });
    console.log(assignedTask);
    

    if (!assignedTask) {
      res.status(403).json({ message: "No task assigned to you yet" });
    }
    const count = await Inquiry.countDocuments(assignedTask[0].queryObject);
    const totalPages = Math.ceil(count / limit);

    console.log(assignedTask[0].queryObject);
    
    const inquiries = await Inquiry.find(assignedTask[0].queryObject)
      .sort({ createdAt: -1 }) // Sort by creation date in descending order (latest first)
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    res.send({
      inquiries: inquiries,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error("Error calling API:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    // Use the deleteMany method to delete all documents in the Flights collection
    const result = await Inquiry.deleteMany({});

    res.send({
      message: `${result.deletedCount} Inquiries deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting inquiries:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add comment to inquiry

exports.updateStatus = async (req, res) => {
  const { user, comment, status } = req.body;
  const { inquiryId } = req.params;

  try {
    const inquiry = await Inquiry.findById(inquiryId);

    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    inquiry.status = status;
    inquiry.comments.push({ user, comment, status });
    await inquiry.save();

    res.json({ message: "Comment added successfully", inquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
