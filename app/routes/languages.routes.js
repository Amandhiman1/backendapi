module.exports = app => {
  const languages = require("../controllers/languages.controller.js");
  const { authenticateToken } = require("../middleware/auth.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", authenticateToken, languages.create);

  // Retrieve all languages
  router.get("/", languages.findAll);

  // Retrieve all published languages
  router.get("/published", languages.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/:id", languages.findOne);

  // Update a Tutorial with id
  router.put("/:id", authenticateToken, languages.update);

  // Delete a Tutorial with id
  router.delete("/:id", authenticateToken, languages.delete);

  // Create a new Tutorial
  router.delete("/", authenticateToken, languages.deleteAll);

  app.use("/api/languages", router);
};
