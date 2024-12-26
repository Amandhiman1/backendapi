module.exports = app => {
  const airports = require("../controllers/airports.controller.js");
  const { authenticateToken } = require("../middleware/auth.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", authenticateToken, airports.create);

  router.post("/add-airports", authenticateToken, airports.createMultipleAirports);

  // Retrieve all airports
  router.get("/", airports.findAll);

  // Retrieve all published airports
  router.get("/published", airports.findAllPublished);

  // Retrieve a single Tutorial with id
  // router.get("/:id", airports.findOne);

  router.get("/code/:code", airports.findByCode);
  router.get("/country-code/:code", airports.findByCountry);
  router.get("/search", airports.findByQuery);
  router.get("/nearest-airport", airports.getNearestAirport);

  // Update a Tutorial with id
  router.put("/:id", authenticateToken, airports.update);

  // Delete a Tutorial with id
  router.delete("/:id", authenticateToken, airports.delete);

  // Create a new Tutorial
  router.delete("/", authenticateToken, airports.deleteAll);

  app.use("/api/airports", router);
};
