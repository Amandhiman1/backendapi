module.exports = app => {
  const countries = require("../controllers/countries.controller.js");
  const { authenticateToken } = require("../middleware/auth.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", authenticateToken, countries.create);

  router.post("/add-countries", authenticateToken, countries.createMultipleCountries);

  // Retrieve all countries
  router.get("/", countries.findAll);

  // Retrieve all published countries
  router.get("/published", countries.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/:id", countries.findOne);

  // Update a Tutorial with id
  router.put("/:id", authenticateToken, countries.update);

  // Delete a Tutorial with id
  router.delete("/:id", authenticateToken, countries.delete);

  // Create a new Tutorial
  router.delete("/", authenticateToken, countries.deleteAll);

  app.use("/api/countries", router);
};
