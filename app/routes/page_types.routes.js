
module.exports = app => {
  const page_types = require("../controllers/page_types.controller.js");
  const { authenticateToken } = require("../middleware/auth.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", page_types.create);
  // Create a new Tutorial
  router.post("/filter", page_types.filter);
  // Retrieve all page_types
  router.get("/", page_types.findAll);
  
  // Retrieve all published page_types
  router.get("/published", page_types.findAllPublished);
  router.get("/allcount", page_types.allcount);

  // Retrieve a single Tutorial with id
  router.get("/:id", page_types.findOne);
  
  // Update a Tutorial with id
  router.put("/:id", page_types.update);
  router.put("/add-data/:id", page_types.addData);

  // Delete a Tutorial with id
  router.delete("/:id", page_types.delete);

  // Create a new Tutorial
  router.delete("/", page_types.deleteAll);

  app.use("/api/page_types", router);
};
