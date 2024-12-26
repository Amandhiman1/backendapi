module.exports = app => {
  const { authenticateToken } = require("../middleware/auth.js");
  const webpages = require("../controllers/webpages.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", authenticateToken, webpages.create);
  router.post("/filter", webpages.filter);
  router.post("/single", webpages.single);
  router.post("/bylang", webpages.bylang);
  router.post("/byslug", webpages.singleBySlug);



  // Retrieve all webpages
  router.get("/", webpages.findAll);

  // Retrieve all published webpages
  router.get("/published", webpages.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/:id", webpages.findOne);

  // Update a Tutorial with id
  router.put("/:id", authenticateToken, webpages.update);

  // Delete a Tutorial with id
  router.delete("/:id", authenticateToken, webpages.delete);

  // Create a new Tutorial
  router.delete("/", authenticateToken, webpages.deleteAll);

  app.use("/api/webpages", router);
};
